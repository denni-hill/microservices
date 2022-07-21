const BaseError = require("./base.error");

class InternalServerError extends BaseError {
  error = undefined;
  constructor(message, error) {
    super(message);
    this.error = error;
  }

  getResponseBody() {
    return "Internal Server Error";
  }

  getStatusCode() {
    return 500;
  }
}

module.exports = InternalServerError;
