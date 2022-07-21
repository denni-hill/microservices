import BaseError from "./base.error";

class ForbiddenError extends BaseError {
  params: unknown;
  constructor(message: string, params: unknown) {
    super(message);
    this.params = params;
  }

  getResponseBody = () => this.message;
  getStatusCode = () => 403;
}

export default ForbiddenError;
