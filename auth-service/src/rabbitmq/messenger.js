const events = require("events");
const amqp = require("amqplib/callback_api");
const eventEmmiter = new events.EventEmitter();

let connection = undefined;

class Messenger {
  connect = () =>
    new Promise((res, rej) => {
      amqp.connect("amqp://rabbitmq", (error, conn) => {
        if (error) {
          rej(error);
          return;
        }

        connection = conn;
        res(conn);
      });
    });

  disconnect() {
    if (connection !== undefined) {
      connection.close();
      connection = undefined;
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

    connection.createChannel((error, channel) => {
      if (error) throw error;

      channel.assertQueue(queue, {
        durable: false
      });

      channel.sendToQueue(queue, Buffer.from(jsonMessage));
    });
  }

  async consumeMessages(queue, messageHandler) {
    if (connection === undefined) await this.connect();

    if (!eventEmmiter.eventNames().includes(queue)) {
      connection.createChannel((error, channel) => {
        if (error) throw error;

        channel.assertQueue(queue, {
          durable: false
        });

        channel.consume(
          queue,
          (msg) => {
            eventEmmiter.emit(queue, JSON.parse(msg.toString()));
          },
          {
            noAck: true
          }
        );
      });
    }

    eventEmmiter.on(queue, messageHandler);
  }
}

module.exports = new Messenger();
