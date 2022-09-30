const BaseError = require("./base.error");

class ValidationError extends BaseError {
  error = undefined;
  constructor(error) {
    super("Validation Error");
    this.error = error;
  }

  getResponseBody() {
    return {
      statusCode: this.getStatusCode(),
      message: this.error
    };
  }

  getStatusCode() {
    return 422;
  }
}

module.exports = ValidationError;
