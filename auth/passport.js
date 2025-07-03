const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const dbUser = require("../db/userDb");

passport.use(
    new LocalStrategy(async (username, password, done) => {
        try {
            let user = await dbUser.getByUsername(username);
            if (!user) {
                return done(null, false, {
                    message: `username:Username not found:${username}:${password}`,
                });
            }

            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return done(null, false, {
                    message: `password:Incorrect password:${username}:${password}`,
                });
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    })
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await dbUser.get(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});
