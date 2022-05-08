class PayloadedError extends Error {
  payload = undefined;

  constructor(message, payload) {
    super(message);
    this.payload = payload;
  }
}

module.exports = PayloadedError;
