import winston from "winston";

export default function consoleTransport() {
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
    handleExceptions: true,
    level: process.env.NODE_ENV === "test" ? "debug" : "info"
  });
}
