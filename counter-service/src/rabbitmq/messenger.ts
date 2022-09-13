import { EventEmitter } from "events";
import amqp, { ConsumeMessage } from "amqplib";
import InternalServerError from "../errors/internal.error";
const consumersEventEmitter = new EventEmitter();
const messengerEventEmitter = new EventEmitter();

export type MessengerEvents = "connect";

let connection: amqp.Connection;
let consumer: amqp.Channel;
let publisher: amqp.Channel;
const publisherKnownQueues: string[] = [];

class Messenger {
  async connect(): Promise<void> {
    connection = await amqp.connect(`amqp://${process.env.RABBITMQ_HOST}`);
    [publisher, consumer] = await Promise.all([
      connection.createChannel(),
      connection.createChannel()
    ]);

    messengerEventEmitter.emit("connect", this);
  }

  addEventListener(
    eventName: MessengerEvents,
    handler: (messenger: Messenger) => void
  ) {
    messengerEventEmitter.on(eventName, handler);
  }

  removeEventListener(
    eventName: MessengerEvents,
    handler: (...arsg: unknown[]) => void
  ) {
    messengerEventEmitter.off(eventName, handler);
  }

  async disconnect() {
    if (connection !== undefined) {
      await Promise.all([publisher.close(), consumer.close()]);
      await connection.close();
      connection = publisher = consumer = undefined;
    }
  }

  async sendMessage(queue: string, msg: unknown) {
    let jsonMessage: string;
    try {
      jsonMessage = JSON.stringify(msg);
    } catch (e) {
      throw e;
    }

    if (connection === undefined)
      throw new InternalServerError(
        "RabbitMQ is not connected",
        new Error("RabbitMQ is not connected")
      );

    if (!publisherKnownQueues.includes(queue)) {
      await publisher.assertQueue(queue, { durable: false });
      publisherKnownQueues.push(queue);
    }

    publisher.sendToQueue(queue, Buffer.from(jsonMessage));
  }

  async consumeMessages(
    queue: string,
    messageHandler: { (msg: ConsumeMessage): void }
  ) {
    if (connection === undefined)
      throw new InternalServerError(
        "RabbitMQ is not connected",
        new Error("RabbitMQ is not connected")
      );

    if (!consumersEventEmitter.eventNames().includes(queue)) {
      await consumer.assertQueue(queue, { durable: false });
      await consumer.consume(
        queue,
        (msg) => {
          consumersEventEmitter.emit(queue, msg);
        },
        { noAck: true }
      );
    }

    consumersEventEmitter.on(queue, messageHandler);
  }
}

export default new Messenger();
