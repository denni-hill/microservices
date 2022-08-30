const events = require("events");
const amqp = require("amqplib");
const eventEmmiter = new events.EventEmitter();

/**
 * @type { amqp.Connection }
 */
let connection = undefined;
/**
 * @type { amqp.Channel }
 */
let consumer = undefined;
/**
 * @type { amqp.Channel }
 */
let publisher = undefined;
let publisherKnownQueues = [];

class Messenger {
  async connect() {
    connection = await amqp.connect(`amqp://${process.env.RABBITMQ_HOST}`);
    [consumer, publisher] = await Promise.all([
      connection.createChannel(),
      connection.createChannel()
    ]);
  }

  async disconnect() {
    if (connection !== undefined) {
      await Promise.all([consumer.close(), publisher.close()]);
      await connection.close();
      connection = consumer = publisher = undefined;
    }
  }

  async sendMessage(queue, msg) {
    let jsonMessage;
    try {
      jsonMessage = JSON.stringify(msg);
    } catch (e) {
      throw new Error("Could not convert message to JSON");
    }

    if (connection === undefined) await this.connect();

    if (!publisherKnownQueues.includes(queue)) {
      await publisher.assertQueue(queue, { durable: false });
      publisherKnownQueues.push(queue);
    }

    publisher.sendToQueue(queue, Buffer.from(jsonMessage));
  }

  async consumeMessages(queue, messageHandler) {
    if (connection === undefined) await this.connect();

    if (!eventEmmiter.eventNames().includes(queue)) {
      await consumer.assertQueue(queue, { durable: false });
      await consumer.consume(queue, (msg) => {
        eventEmmiter.emit(queue, JSON.parse(msg.toString()), {
          noAck: true
        });
      });
    }

    eventEmmiter.on(queue, messageHandler);
  }
}

module.exports = new Messenger();
