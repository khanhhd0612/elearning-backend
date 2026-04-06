const passport = require("passport");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");
const config = require("./config");

passport.use(
    new JwtStrategy(
        {
            secretOrKey: config.jwt.accessSecret,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            passReqToCallback: true
        },
        async (req, payload, done) => {
            try {
                const user = await User.findById(payload.id);

                if (!user) {
                    return done(null, false);
                }

                if (!user.isActive) {
                    return done(
                        new ApiError(401, 'Tài khoản đã bị vô hiệu hóa'),
                        false
                    );
                }

                return done(null, user);
            } catch (err) {
                console.error('JWT Strategy error:', err);
                return done(err, false);
            }
        }
    )
);

module.exports = passport;