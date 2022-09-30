const BaseError = require("./base.error");

class ConflictError extends BaseError {
  params = undefined;
  constructor(message, params) {
    super(message);
    this.params = params;
  }

  getResponseBody() {
    return {
      statusCode: this.getStatusCode(),
      message: this.message
    };
  }

  getStatusCode() {
    return 409;
  }
}

module.exports = ConflictError;
