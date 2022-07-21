import BaseError from "./base.error";

class InternalServerError extends BaseError {
  error: Error;

  constructor(message: string, error: Error) {
    super(message);
    this.error = error;
  }

  getResponseBody = () => "Internal Server Error";
  getStatusCode = () => 500;
}

export default InternalServerError;
