class ValidationError extends Error {
  result = undefined;
  constructor(result) {
    super("Validation Error");
    this.result = result;
  }
}

module.exports = ValidationError;
