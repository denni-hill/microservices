class BaseError extends Error {
  getStatusCode() {
    return 500;
  }

  getResponseBody() {
    return;
  }
}

module.exports = BaseError;
