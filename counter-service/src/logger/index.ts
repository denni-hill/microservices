import winston from "winston";
import consoleTransport from "./transports/console";
import elasticsearchTransport from "./transports/elasticsearch";

const logger = winston.createLogger({
  format: winston.format.json(),
  defaultMeta: { service: "counter-service" }
});

logger.add(elasticsearchTransport());
if (process.env.NODE_ENV === "development") logger.add(consoleTransport());

class Logger {}

export default new Logger();
