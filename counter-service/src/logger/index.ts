import winston from "winston";
import consoleTransport from "./transports/console";
import ecsFormat from "@elastic/ecs-winston-format";
import fileTransport from "./transports/file";

const logger = winston.createLogger({
  format: ecsFormat({ convertReqRes: true }),
  transports: [consoleTransport(), fileTransport()],
  defaultMeta: { "service.name": "counter-service" }
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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    logger.error(...params);
    return this;
  };

  warn: LeveledLogMethod = (...params) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    logger.warn(...params);
    return this;
  };

  info: LeveledLogMethod = (...params) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    logger.info(...params);
    return this;
  };

  http: LeveledLogMethod = (...params) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    logger.http(...params);
    return this;
  };

  verbose: LeveledLogMethod = (...params) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    logger.verbose(...params);
    return this;
  };

  debug: LeveledLogMethod = (...params) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    logger.debug(...params);
    return this;
  };
}

export default new Logger();
