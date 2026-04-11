const mongoose = require('mongoose');
const app = require('./app');
require('dotenv').config();
const { initCronJobs } = require('./src/cronjob/cron');
const { redisClient, connectRedis } = require('./src/config/redis');

const PORT = process.env.PORT || 4000;
let server;

const gracefulShutdown = async (signal) => {
    console.log(`\n${signal} received. Starting graceful shutdown...`);

    if (server) {
        server.close(async () => {
            console.log('HTTP server closed');
            try {
                await mongoose.connection.close();
                console.log('MongoDB connection closed');

                // Đóng Redis an toàn
                if (redisClient.isOpen) {
                    await redisClient.quit();
                    console.log('Redis connection closed');
                }

                process.exit(0);
            } catch (err) {
                console.error('Error during shutdown:', err);
                process.exit(1);
            }
        });

        setTimeout(() => {
            console.error('Forced shutdown after timeout');
            process.exit(1);
        }, 10000);
    } else {
        process.exit(0);
    }
};

const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('Connected to MongoDB successfully');

        await connectRedis();

        initCronJobs();

        server = app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (err) {
        console.error('Server startup error:', err);
        process.exit(1);
    }
};

startServer();

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));