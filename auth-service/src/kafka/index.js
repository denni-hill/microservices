const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "auth_service",
  brokers: [`${process.env.KAFKA_HOST || "localhost"}:9092`]
});

const producer = kafka.producer();

const connectKafka = async () => {
  try {
    await producer.connect();
    console.log("Kafka is connected successfully...");
  } catch (e) {
    console.log("Failed to connect kafka!", e);
  }
};

const disconnectKafka = async () => {
  try {
    await producer.disconnect();
    console.log("Kafka is disconnected successfully...");
  } catch (e) {
    console.log("Failed to disconnect kafka!", e);
  }
};

module.exports = {
  kafka,
  producer,
  connectKafka,
  disconnectKafka
};
