import logger from "../logger";
import BaseError from "./base.error";

class InternalServerError extends BaseError {
  constructor(
    message: string,
    public error: Error,
    public params?: Record<string, unknown>
  ) {
    super(message);
  }

  getResponseBody = () => "Internal Server Error";
  getStatusCode = () => 500;
  logError(): void {
    logger.error(this.message, this.error, this.params);
    logger.debug(this.error);
  }
}

export default InternalServerError;
