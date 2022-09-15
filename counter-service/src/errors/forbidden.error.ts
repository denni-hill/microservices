import logger from "../logger";
import BaseError from "./base.error";

class ForbiddenError extends BaseError {
  constructor(message = "Forbidden", public params?: Record<string, unknown>) {
    super(message);
  }

  getResponseBody = () => this.message;
  getStatusCode = () => 403;
  logError(): void {
    logger.info(this.message, this.params);
  }
}

export default ForbiddenError;
