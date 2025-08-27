import { createLogger, format, transports, addColors } from "winston";

const { combine, timestamp, printf, colorize } = format;

const customLevels = {
  levels: {
    crit: 0,   // Critique - global failure
    error: 1,  // Error - localized failure
    warn: 2,   // Warning
    info: 3,   // General info
    debug: 4   // Debugging
  },
  colors: {
    crit: "redBG white",
    error: "red",
    warn: "yellow",
    info: "green",
    debug: "blue"
  }
};

const logFormat = printf(({ level, message, timestamp }) => {
  return `[${timestamp}] ${level}: ${message}`;
});

const logger = createLogger({
  levels: customLevels.levels,
  level: process.env.LOG_LEVEL || "info",
  format: combine(
    colorize({ all: true }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    logFormat
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: "logs/combined.log" }),
    new transports.File({ filename: "logs/error.log", level: "error" }),
    new transports.File({ filename: "logs/critical.log", level: "crit" })
  ],
  exceptionHandlers: [
    new transports.File({ filename: "logs/exceptions.log" })
  ],
  rejectionHandlers: [
    new transports.File({ filename: "logs/rejections.log" })
  ]
});

addColors(customLevels.colors);

export default logger;
