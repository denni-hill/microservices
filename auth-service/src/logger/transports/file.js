const winston = require("winston");

function fileTransport() {
  return new winston.transports.File({
    level: "info",
    dirname: "/usr/service-logs",
    filename: "auth-service-combined.log"
  });
}

module.exports = fileTransport;
