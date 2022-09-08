import BaseError from "./base.error";

class NotFoundError extends BaseError {
  constructor(public params?: unknown, public alias?: string) {
    super(typeof alias === "string" ? `${alias} is not found` : "Not found");
  }

  getResponseBody = () => this.params;
  getStatusCode = () => 404;
}

export default NotFoundError;
