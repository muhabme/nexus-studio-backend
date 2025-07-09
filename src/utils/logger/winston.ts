import path from "path"
import winston from "winston"
import DailyRotateFile from "winston-daily-rotate-file"

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
}

const colors: Record<keyof typeof levels, string> = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
}

winston.addColors(colors)

const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    ({ timestamp, level, message, service, executionId, workflowId, userId, ...meta }) => {
      let logMessage = `[${timestamp}] [${level}]`

      if (service) {
        logMessage += ` [${service}]`
      }

      if (executionId) {
        logMessage += ` [exec:${executionId}]`
      }

      if (workflowId) {
        logMessage += ` [workflow:${workflowId}]`
      }

      if (userId) {
        logMessage += ` [user:${userId}]`
      }

      logMessage += `: ${message}`

      // Add metadata if present
      if (Object.keys(meta).length > 0) {
        logMessage += ` \n${JSON.stringify(meta)}`
      }

      return logMessage
    },
  ),
)

const transports: winston.transport[] = [
  new winston.transports.Console({
    level: process.env.LOG_LEVEL || "info",
    format: winston.format.combine(winston.format.colorize({ all: true }), format),
  }),

  new DailyRotateFile({
    level: "error",
    filename: path.join(process.env.LOG_DIR ?? "logs", "error-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d",
    format: winston.format.combine(winston.format.uncolorize(), winston.format.json()),
  }),

  new DailyRotateFile({
    level: "info",
    filename: path.join(process.env.LOG_DIR ?? "logs", "combined-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "30d",
    format: winston.format.combine(winston.format.uncolorize(), winston.format.json()),
  }),

  new DailyRotateFile({
    level: "http",
    filename: path.join(process.env.LOG_DIR ?? "logs", "http-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "7d",
    format: winston.format.combine(winston.format.uncolorize(), winston.format.json()),
  }),

  new DailyRotateFile({
    level: "info",
    filename: path.join(process.env.LOG_DIR ?? "logs", "workflow-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "30d",
    format: winston.format.combine(winston.format.uncolorize(), winston.format.json()),
  }),
]

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  levels,
  format,
  transports,

  exceptionHandlers: [
    new winston.transports.Console({
      level: process.env.LOG_LEVEL || "info",
      format: winston.format.combine(winston.format.colorize({ all: true }), format),
    }),

    new winston.transports.File({
      filename: path.join(process.env.LOG_DIR ?? "logs", "exceptions.log"),
      format: winston.format.combine(winston.format.uncolorize(), winston.format.json()),
    }),
  ],

  rejectionHandlers: [
    new winston.transports.Console({
      level: process.env.LOG_LEVEL || "info",
      format: winston.format.combine(winston.format.colorize({ all: true }), format),
    }),

    new winston.transports.File({
      filename: path.join(process.env.LOG_DIR ?? "logs", "rejections.log"),
      format: winston.format.combine(winston.format.uncolorize(), winston.format.json()),
    }),
  ],

  exitOnError: false,
})

export default logger
