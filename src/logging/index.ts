import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.simple(),
  transports: [
    // new winston.transports.File({ filename: "error.log", level: "error" }),
    // new winston.transports.File({ filename: "combined.log" }),
    new winston.transports.Console({ format: winston.format.simple() }),
  ],
});
const loggerPrefix: string = "PAYMENT-GWAY";

export const loggerFactory = (moduleName: string) => ({
  debug: (msg: string, ...meta: any[]) => logger.debug(`[${loggerPrefix}]: ${moduleName} - ${msg}`, meta),

  info: (msg: string, ...meta: any[]) => logger.info(`[${loggerPrefix}]: ${moduleName} - ${msg}`, meta),

  warn: (msg: string, ...meta: any[]) => logger.warn(`[${loggerPrefix}]: ${moduleName} - ${msg}`, meta),

  error: (msg: string, ...meta: any[]) => logger.error(`[${loggerPrefix}]: ${moduleName} - ${msg}`, meta),

  fatal: (msg: string, ...meta: any[]) => logger.error(`[${loggerPrefix}]: ${moduleName} - FATAL! - ${msg}`, meta),
});

export type CustomLogger = {
  debug: (msg: string, ...meta: any[]) => winston.Logger;
  info: (msg: string, ...meta: any[]) => winston.Logger;
  warn: (msg: string, ...meta: any[]) => winston.Logger;
  error: (msg: string, ...meta: any[]) => winston.Logger;
  fatal: (msg: string, ...meta: any[]) => winston.Logger;
};
