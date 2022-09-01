const winston = require("winston");
const consoleTransport = require("./transports/console");
const fileTransport = require("./transports/file");
const ecsFormat = require("@elastic/ecs-winston-format");

const logger = winston.createLogger({
  format: ecsFormat({ convertReqRes: true }),
  transports: [consoleTransport(), fileTransport()],
  defaultMeta: { "service.name": "auth-service" }
});

class Logger {
  error(...params) {
    logger.error(...params);
    return this;
  }

  warn(...params) {
    logger.warn(...params);
    return this;
  }

  info(...params) {
    logger.info(...params);
    return this;
  }

  http(...params) {
    logger.http(...params);
    return this;
  }

  verbose(...params) {
    logger.verbose(...params);
    return this;
  }

  debug(...params) {
    logger.debug(...params);
    return this;
  }
}

module.exports = new Logger();
