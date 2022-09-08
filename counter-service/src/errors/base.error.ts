import logger from "../logger";

abstract class BaseError extends Error {
  constructor(public message: string) {
    super(message);
    this.logError();
  }

  abstract getResponseBody(): unknown;
  abstract getStatusCode(): number;
  logError(): void {
    logger.info(this.message, this);
  }
}

export default BaseError;
