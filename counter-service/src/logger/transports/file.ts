import path from "path";
import winston from "winston";

export default function fileTransport() {
  return new winston.transports.File({
    level: "info",
    dirname: path.join("/usr/service-logs"),
    filename: "counter-service-combined.log"
  });
}
