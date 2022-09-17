import {
  ArgumentsHost,
  Catch,
  HttpException,
  InternalServerErrorException
} from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import logger from "./winston/logger";

@Catch()
export class ExceptionsFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    if (exception instanceof HttpException) {
      if (exception instanceof InternalServerErrorException) {
        logger.error(exception.message, {
          cause: exception.cause,
          response: exception.getResponse()
        });
      } else
        logger.info(exception.message, {
          cause: exception.cause,
          response: exception.getResponse()
        });
    } else {
      logger.error("Internal Server Error", exception);
    }

    super.catch(exception, host);
  }
}
