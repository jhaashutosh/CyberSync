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
app.use(express.json());
app.use(cors());

// Set up multer for handling file uploads
const storage = multer.memoryStorage(); // Use memory storage for simplicity
const upload = multer({ storage: storage });

const generateTaskId = () => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

// Task queue to hold tasks until requested by the mobile device
const taskQueue = [];
let crackedPassword = 0;

// Set up endpoint for uploading file
app.post("/upload-file", upload.single("passwordFile"), (req, res) => {
  const { actualHash } = req.body;
  const passwordFile = req.file.buffer.toString();
  const detectedAlgorithm = detectHashAlgorithm(actualHash);

  const taskId = generateTaskId();

  if (detectedAlgorithm) {
    const passwords = passwordFile.split(/\r?\n/).filter(Boolean);
    const passwordsChunks = chunkArray(
      passwords,
      Math.ceil(passwords.length / 3)
    );

    // Store file and metadata in taskQueue storage
    taskQueue.push({
      taskId,
      passwordsChunks,
      actualHash,
      detectedAlgorithm,
    });

    res.json({
      message: "File uploaded. Wait for mobile request.",
      taskId,
    });
  }
});

// Endpoint to assign a task to the mobile device
app.post("/assign-task", (req, res) => {
  console.log(taskQueue);
  if (taskQueue.length === 0) {
    return res.json({ message: "No tasks available." });
  } else {
    console.log("It is working!!!");
  }

  const assignedTask = taskQueue.shift();

  res.json({
    message: `Task assigned to the mobile device for task Id: ${assignedTask.taskId}`,
    task: assignedTask,
  });
});

// Endpoint to receive results from the mobile device
app.post("/submit-results", (req, res) => {
  const { results } = req.body;
  crackedPassword = results.password;
  res.json({ message: "Results received successfully." });
});

app.get("/get-results", (req, res) => {
  if (crackedPassword !== 0) {
    res.json({ crackedPassword });
  } else {
    res.json(false);
  }
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Distributed Server is running on port ${PORT}`);
});

// Connect to RabbitMQ and start consuming messages
connectToRabbitMQ()
  .then(({ channel }) => {
    consumeMessages(channel, processPasswordChunk);
  })
  .catch((error) => {
    console.error("Error connecting to RabbitMQ:", error.message);
  });
