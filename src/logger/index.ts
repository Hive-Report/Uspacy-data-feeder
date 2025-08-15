import { config } from "../config.js";
import buildDevLogger from "./dev-logger.js";
import buildProdLogger from "./prod-logger.js";
import { Logger } from "winston";

let baseLogger: Logger;
console.log(`NODE_ENV: ${config.NODE_ENV}`);
if (config.NODE_ENV === "development") {
  baseLogger = buildDevLogger();
} else {
  baseLogger = buildProdLogger();
}

export function createLogger(serviceName: string): Logger {
  return baseLogger.child({ service: serviceName });
}

const logger = baseLogger;
export default logger;
