import { ConsumerConfig, Kafka } from "kafkajs";

export const kafka = new Kafka({
  clientId: "counter_service",
  brokers: [`${process.env.KAFKA_HOST || "localhost"}:9092`]
});
const consumerOptions: ConsumerConfig = {
  groupId: "microservices",
  allowAutoTopicCreation: true
};

export const userDeletedConsumer = kafka.consumer(consumerOptions);

export const connectKafka = async () => {
  try {
    userDeletedConsumer.connect().then(() => {
      userDeletedConsumer.subscribe({ topic: "user-deleted" });
    });

    console.log("Kafka server is connected successfully...");
  } catch (e) {
    console.log("Failed to connect kafka server!", e);
  }
};

export const disconnectKafka = async () => {
  try {
    await Promise.all([userDeletedConsumer.disconnect]);

    console.log("Kafka server is disconnected successfully...");
  } catch (e) {
    console.log("Failed to disconnect kafka server!", e);
  }
};
