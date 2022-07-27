const { ValidationResult } = require("chain-validator-js/dist/result");
const BaseError = require("./base.error");

class ValidationError extends BaseError {
  result = undefined;
  constructor(result) {
    super("Validation Error");
    this.result = result;
  }

  getResponseBody() {
    if (this.result instanceof ValidationResult) {
      return this.result.errors;
    } else return this.result;
  }

  getStatusCode() {
    return 422;
  }
}

module.exports = ValidationError;
