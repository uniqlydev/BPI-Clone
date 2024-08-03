import winston, { Logger } from 'winston';
import { LoggingWinston } from '@google-cloud/logging-winston';
import fs from 'fs';
import path from 'path';

// Define log directory and file
const logDirectory = './logs';
const logFile = 'app.log';
const logFilePath = path.join(logDirectory, logFile);

// Ensure the logs directory exists
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

// Create a Winston logger that streams to Cloud Logging and a local file
const logger: Logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console(), // Logs to the console
    new winston.transports.File({
      filename: logFilePath,
      handleExceptions: true // Handle file write errors gracefully
    }),
    new LoggingWinston() // Logs to Google Cloud Logging
  ],
});

// Ensure the log file is created and then make it read-only
fs.access(logFilePath, fs.constants.F_OK, (err) => {
  if (!err) {
    // Set file permissions to read-only
    fs.chmod(logFilePath, 0o444, (chmodErr) => {
      if (chmodErr) {
        console.error(`Failed to make ${logFile} read-only: ${chmodErr.message}`);
      } else {
        console.log(`${logFile} is now read-only.`);
      }
    });
  } else {
    console.error(`Log file does not exist: ${err.message}`);
  }
});

export default logger;
