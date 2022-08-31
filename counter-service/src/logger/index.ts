import winston from "winston";
import consoleTransport from "./transports/console";
import ecsFormat from "@elastic/ecs-winston-format";
import fileTransport from "./transports/file";

const logger = winston.createLogger({
  format: ecsFormat({ convertReqRes: true }),
  transports: [consoleTransport(), fileTransport()],
  defaultMeta: { service: "counter-service" }
});

type LogCallback = (
  error?: unknown,
  level?: string,
  message?: string,
  meta?: unknown
) => void;

interface LeveledLogMethod {
  (message: string, callback: LogCallback): Logger;
  (message: string, meta: unknown, callback: LogCallback): Logger;
  (message: string, ...meta: unknown[]): Logger;
  (message: unknown): Logger;
  (infoObject: object): Logger;
}

class Logger {
  error: LeveledLogMethod = (...params) => {
    logger.error(params);
    return this;
  };

  warn: LeveledLogMethod = (...params) => {
    logger.warn(params);
    return this;
  };

  info: LeveledLogMethod = (...params) => {
    logger.info(params);
    return this;
  };

  http: LeveledLogMethod = (...params) => {
    logger.http(params);
    return this;
  };

  verbose: LeveledLogMethod = (...params) => {
    logger.verbose(params);
    return this;
  };

  debug: LeveledLogMethod = (...params) => {
    logger.debug(params);
    return this;
  };
}

export default new Logger();
