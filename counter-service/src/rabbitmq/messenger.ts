import { EventEmitter } from "events";
import amqp, { ConsumeMessage } from "amqplib";
const eventEmmiter = new EventEmitter();

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

    if (connection === undefined) await this.connect();

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
    if (connection === undefined) await this.connect();

    if (!eventEmmiter.eventNames().includes(queue)) {
      await consumer.assertQueue(queue, { durable: false });
      await consumer.consume(
        queue,
        (msg) => {
          eventEmmiter.emit(queue, msg);
        },
        { noAck: true }
      );
    }

    eventEmmiter.on(queue, messageHandler);
  }
}

export default new Messenger();
