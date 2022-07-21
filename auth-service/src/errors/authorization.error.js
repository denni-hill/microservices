const BaseError = require("./base.error");

class AuthorizationError extends BaseError {
  getResponseBody() {
    return this.message;
  }

  getStatusCode() {
    return 401;
  }
}

module.exports = AuthorizationError;
