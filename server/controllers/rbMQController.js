const amqp = require("amqplib");

// Function to connect to RabbitMQ
const connectToRabbitMQ = async () => {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    console.log("Connected to RabbitMQ successfully.");

    return { connection, channel };
  } catch (error) {
    console.error("Error connecting to RabbitMQ:", error.message);
    throw error;
  }
};

// Function to consume messages from the queue
const consumeMessages = async (channel, processPasswordChunk) => {
  await channel.assertQueue("password_chunks", { durable: false });

  channel.consume("password_chunks", async (msg) => {
    const { actualHash, detectedAlgorithm, passwordsChunk } = JSON.parse(
      msg.content.toString()
    );

    const { validResults, elapsedTime } = await processPasswordChunk(
      actualHash,
      detectedAlgorithm,
      passwordsChunk
    );

    // Send the results back to the frontend
    channel.sendToQueue(
      "results_queue", // Use a different queue name for results
      Buffer.from(JSON.stringify({ validResults, elapsedTime }))
    );

    channel.ack(msg);
  });
};

module.exports = {
  connectToRabbitMQ,
  consumeMessages,
};
