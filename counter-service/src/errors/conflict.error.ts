import logger from "../logger";
import BaseError from "./base.error";

export class ConflictError extends BaseError {
  getResponseBody = () => this.message;
  getStatusCode = () => 409;

  logError(): void {
    logger.info(this.message);
  }
}
