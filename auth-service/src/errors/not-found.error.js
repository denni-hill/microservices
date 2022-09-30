const BaseError = require("./base.error");

class NotFoundError extends BaseError {
  params = undefined;
  constructor(params, name) {
    if (typeof name === "string") super(`${name} is not found`);
    else super("Not found");
    this.params = params;
  }

  getResponseBody() {
    return {
      statusCode: this.getStatusCode(),
      message: this.message
    };
  }

  getStatusCode() {
    return 404;
  }
}

module.exports = NotFoundError;
