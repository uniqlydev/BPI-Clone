import winston, { Logger } from 'winston';
import { LoggingWinston } from '@google-cloud/logging-winston';
import fs from 'fs';
import path from 'path';
import DailyRotateFile from 'winston-daily-rotate-file';

// Define log directory and file pattern
const logDirectory = './logs';
const logFilePattern = 'app-%DATE%.log';
const logFilePath = path.join(logDirectory, logFilePattern);

// Ensure the logs directory exists
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

// Create a Winston logger that streams to Cloud Logging and a local file
const logger: Logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console(), // Logs to the console
    new DailyRotateFile({
      filename: logFilePath,
      datePattern: 'YYYY-MM-DD', // Log file will be named with the date (e.g., app-2024-08-08.log)
      maxSize: '20m', // Maximum size of a log file before it gets rotated
      maxFiles: '14d', // Maximum number of days to keep log files
      handleExceptions: true // Handle file write errors gracefully
    }),
    new LoggingWinston() // Logs to Google Cloud Logging
  ],
});

// Ensure the log file is created and then make it read-only
fs.access(logFilePath.replace('%DATE%', new Date().toISOString().split('T')[0]), fs.constants.F_OK, (err) => {
  if (!err) {
    // Set file permissions to read-only
    fs.chmod(logFilePath.replace('%DATE%', new Date().toISOString().split('T')[0]), 0o444, (chmodErr) => {
      if (chmodErr) {
        console.error(`Failed to make ${logFilePattern} read-only: ${chmodErr.message}`);
      } else {
        console.log(`${logFilePattern} is now read-only.`);
      }
    });
  } else {
    console.error(`Log file does not exist: ${err.message}`);
  }
});

export default logger;
