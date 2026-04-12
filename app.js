const express = require("express");
require("dotenv").config();
const cors = require("cors");
const routes = require("./src/routes/v1");
const { authLimiter, globalLimiter } = require('./src/middlewares/rateLimiter');
const config = require('./src/config/config');
const ApiError = require('./src/utils/ApiError');
const { errorConverter, errorHandler } = require('./src/middlewares/error');
const passport = require('./src/config/passport');
const cookieParser = require('cookie-parser');
const corsOptions = require('./src/config/cors');
const helmet = require('helmet');

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

app.use(passport.initialize());

app.get("/", (req, res) => {
    res.send("Server is running!");
});

if (config.env === 'production') {
    app.use('/v1', globalLimiter);
    app.use('/v1/auth', authLimiter);
}

app.use("/v1", routes);

app.use((req, res, next) => {
    next(new ApiError(404, 'Not found'));
});

app.use(errorConverter);
app.use(errorHandler);

module.exports = app;
