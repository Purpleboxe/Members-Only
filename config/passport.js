const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/user");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).exec();
    return done(null, user.toObject());
  } catch (err) {
    done(err);
  }
});

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const normalizedUsername = username.toLowerCase();
      const user = await User.findOne({ username: normalizedUsername }).exec();
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }

      const isValid = await user.validatePassword(password);

      if (!isValid) {
        return done(null, false, { message: "Incorrect password" });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

module.exports = passport;
