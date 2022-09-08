import BaseError from "./base.error";

class ForbiddenError extends BaseError {
  constructor(message = "Forbidden", public params?: Record<string, unknown>) {
    super(message);
  }

  getResponseBody = () => this.message;
  getStatusCode = () => 403;
}

export default ForbiddenError;
