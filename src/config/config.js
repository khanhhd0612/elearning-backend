const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
    .keys({
        NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),

        PORT: Joi.number().default(4000),
        APP_NAME: Joi.string().required(),

        CLIENT_URL: Joi.string().required(),

        MONGODB_URL: Joi.string().required(),

        // JWT
        JWT_SECRET: Joi.string().required(),
        REFRESH_SECRET: Joi.string().required(),

        // VNPay
        TMN_CODE: Joi.string().allow('').optional(),
        SECURE_SECRET: Joi.string().allow('').optional(),

        // MailJet
        EMAIL: Joi.string().allow('').optional(),
        MJ_APIKEY: Joi.string().allow('').optional(),
        MJ_SECRET_KEY: Joi.string().allow('').optional(),

        // Cloudinary
        CLOUDINARY_CLOUD_NAME: Joi.string().allow('').optional(),
        CLOUDINARY_API_KEY: Joi.string().allow('').optional(),
        CLOUDINARY_API_SECRET: Joi.string().allow('').optional(),

        // SMTP (fallback mail)
        SMTP_HOST: Joi.string().allow('').optional(),
        SMTP_PORT: Joi.number().allow(null).optional(),
    })
    .unknown();

const { value: envVars, error } = envVarsSchema
    .prefs({ errors: { label: 'key' } })
    .validate(process.env);

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
    env: envVars.NODE_ENV,
    port: envVars.PORT,
    appName: envVars.APP_NAME,

    clientUrl: envVars.CLIENT_URL,

    mongoose: {
        url: envVars.MONGODB_URL + (envVars.NODE_ENV === 'test' ? '-test' : ''),
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        },
    },

    jwt: {
        accessSecret: envVars.JWT_SECRET,
        refreshSecret: envVars.REFRESH_SECRET,
    },

    vnpay: {
        tmnCode: envVars.TMN_CODE,
        secureSecret: envVars.SECURE_SECRET,
    },

    mailjet: {
        email: envVars.EMAIL,
        apiKey: envVars.MJ_APIKEY,
        secretKey: envVars.MJ_SECRET_KEY,
    },

    cloudinary: {
        cloudName: envVars.CLOUDINARY_CLOUD_NAME,
        apiKey: envVars.CLOUDINARY_API_KEY,
        apiSecret: envVars.CLOUDINARY_API_SECRET,
    },

    smtp: {
        host: envVars.SMTP_HOST,
        port: envVars.SMTP_PORT,
    },
};
