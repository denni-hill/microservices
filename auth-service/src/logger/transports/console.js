const winston = require("winston");

function consoleTransport() {
  return new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.cli({
        colors: {
          error: "red",
          warn: "yellow",
          info: "blue",
          http: "green",
          verbose: "cyan",
          debug: "white"
        }
      }),
      winston.format.timestamp()
    ),
    handleExceptions: true
  });
}

module.exports = consoleTransport;
