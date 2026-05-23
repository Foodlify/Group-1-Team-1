import winston from "winston";
import path from "path";

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
  return `[${timestamp}] ${level}: ${stack || message}${metaStr}`;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    logFormat
  ),
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        errors({ stack: true }),
        logFormat
      ),
    }),
    new winston.transports.File({
      filename: path.join("logs", "error.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.join("logs", "warn.log"),
      level: "warn",
    }),
    new winston.transports.File({
      filename: path.join("logs", "info.log"),
      level: "info",
    }),
    new winston.transports.File({
      filename: path.join("logs", "http.log"),
      level: "http",
    }),
    new winston.transports.File({
      filename: path.join("logs", "verbose.log"),
      level: "verbose",
    }),
    new winston.transports.File({
      filename: path.join("logs", "debug.log"),
      level: "debug",
    }),
    new winston.transports.File({
      filename: path.join("logs", "combined.log"),
    }),
  ],
});

class LoggerService {
  info(message: string, meta?: Record<string, unknown>): void {
    logger.info(message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    logger.warn(message, meta);
  }

  error(message: string, error?: Error | unknown, meta?: Record<string, unknown>): void {
    if (error instanceof Error) {
      logger.error(message, { ...meta, stack: error.stack, errorMessage: error.message });
    } else {
      logger.error(message, { ...meta, error });
    }
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    logger.debug(message, meta);
  }

  verbose(message: string, meta?: Record<string, unknown>): void {
    logger.verbose(message, meta);
  }

  http(message: string, meta?: Record<string, unknown>): void {
    logger.http(message, meta);
  }
}

export const loggerService = new LoggerService();
export default loggerService;
