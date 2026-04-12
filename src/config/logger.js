const winston = require('winston');
const config = require('./config');

const enumerateErrorFormat = winston.format((info) => {
    if (info instanceof Error || info.message instanceof Error) {
        const error = info instanceof Error ? info : info.message;
        return {
            ...info,
            message: error.stack,
        };
    }
    return info;
});

const logger = winston.createLogger({
    level: config.env === 'development' ? 'debug' : 'info',
    format: winston.format.combine(
        enumerateErrorFormat(),
        winston.format.timestamp(),
        config.env === 'development'
            ? winston.format.colorize()
            : winston.format.uncolorize(),
        winston.format.splat(),
        winston.format.printf(({ level, message, timestamp }) => {
            return `${timestamp} [${level}]: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console({
            stderrLevels: ['error'],
        }),
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
        }),
        new winston.transports.File({
            filename: 'logs/combined.log',
        }),
    ],
});

module.exports = logger;
