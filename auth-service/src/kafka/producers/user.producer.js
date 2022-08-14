const { producer } = require("../index");

class UserProducer {
  async userDeletedEvent(userId) {
    await producer.send({
      topic: "user-deleted",
      messages: [{ key: "deleted-user-id", value: userId }]
    });
  }
}

module.exports = new UserProducer();
