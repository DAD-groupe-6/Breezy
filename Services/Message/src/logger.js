const winston = require("winston");

const customFormat = winston.format.printf(({ timestamp, level, message, service }) => {
    return `[${timestamp}] ${service} | ${level}: ${message}`;
});

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.colorize(),
        customFormat
    ),
    defaultMeta: { service: "Message-Service" },
    transports: [new winston.transports.Console()],
});

module.exports = logger;
