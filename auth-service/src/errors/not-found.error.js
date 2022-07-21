const BaseError = require("./base.error");

class NotFoundError extends BaseError {
  params = undefined;
  constructor(params, name) {
    if (typeof name === "string") super(`${name} is not found`);
    else super("Not found");
    this.params = params;
  }

  getResponseBody() {
    return this.params;
  }

  getStatusCode() {
    return 404;
  }
}

module.exports = NotFoundError;
