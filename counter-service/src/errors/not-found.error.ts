import BaseError from "./base.error";

class NotFoundError extends BaseError {
  params: unknown;

  constructor(params?: unknown, name?: string) {
    super(typeof name === "string" ? `${name} is not found` : "Not found");
    this.params = params;
  }

  getResponseBody = () => this.params;
  getStatusCode = () => 404;
}

export default NotFoundError;
