const express = require("express");
const multer = require("multer");
const cors = require("cors");
const processPasswordChunk = require("./utils/utils");

const {
  detectHashAlgorithm,
  chunkArray,
} = require("./controllers/passwordController");

const {
  connectToRabbitMQ,
  consumeMessages,
} = require("./controllers/rbMQController");

const app = express();
app.use(cors());

// Set up multer for handling file uploads
const storage = multer.memoryStorage(); // Use memory storage for simplicity
const upload = multer({ storage: storage });

// Set up endpoint for uploading file
app.post("/upload-file", upload.single("passwordFile"), async (req, res) => {
  const { actualHash } = req.body;
  const passwordFile = req.file.buffer.toString();
  const detectedAlgorithm = detectHashAlgorithm(actualHash);

  if (detectedAlgorithm) {
    const passwords = passwordFile.split(/\r?\n/).filter(Boolean);
    const passwordsChunks = chunkArray(
      passwords,
      Math.ceil(passwords.length / 3)
    );

    let totalElapsedTime = 0; // Initialize the total elapsed time variable
    let validResults = [];
    try {
      const { connection, channel } = await connectToRabbitMQ();

      // Assert the queue outside of the loop
      await channel.assertQueue("password_chunks", { durable: false });

      // Publish chunks to the queue
      for (const chunk of passwordsChunks) {
        try {
          const startTime = Date.now(); // Record the start time for each chunk
          const chunkResults = await processPasswordChunk(
            actualHash,
            detectedAlgorithm,
            chunk
          );
          const endTime = Date.now(); // Record the end time for each chunk
          const elapsedTime = endTime - startTime; // Calculate the elapsed time for each chunk
          totalElapsedTime += elapsedTime; // Add the elapsed time to the total

          if (chunkResults) {
            validResults.push(chunkResults.crackedPassword);
          }
        } catch (error) {
          console.error("Error processing chunk:", error.message);
        }
      }

      // Check if cracked result is present
      const crackedPassword = validResults[0];

      // Close the channel and connection after sending all chunks
      await channel.close();
      await connection.close();

      res.json({
        message: "File uploaded and processing started.",
        detectedAlgorithm,
        totalElapsedTime,
        crackedPassword: crackedPassword,
      });
    } catch (error) {
      console.error("Error connecting to RabbitMQ:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
});

const PORT = 4001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Connect to RabbitMQ and start consuming messages
connectToRabbitMQ()
  .then(({ channel }) => {
    consumeMessages(channel, processPasswordChunk);
  })
  .catch((error) => {
    console.error("Error connecting to RabbitMQ:", error.message);
  });
