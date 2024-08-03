import winston, { Logger } from 'winston';
import { LoggingWinston } from '@google-cloud/logging-winston';

// Create an instance of the LoggingWinston
const loggingWinston = new LoggingWinston();

// Create a Winston logger that streams to Cloud Logging
// Logs will be written to: "projects/YOUR_PROJECT_ID/logs/winston_log"
const logger: Logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console(),
    loggingWinston,
  ],
});

export default logger;
