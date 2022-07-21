const BaseError = require("./base.error");

class ForbiddenError extends BaseError {
  params = undefined;
  constructor(message, params) {
    super(message);
    this.params = params;
  }

  getResponseBody() {
    return this.message;
  }

  getStatusCode() {
    return 403;
  }
}

module.exports = ForbiddenError;
