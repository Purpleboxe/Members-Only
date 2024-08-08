const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const { pool } = require("../db/db");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const { rows: user } = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [id]
    );
    if (!user[0]) {
      return done(null, false);
    }
    return done(null, user[0]);
  } catch (err) {
    done(err);
  }
});

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const normalizedUsername = username.toLowerCase();
      const { rows: user } = await pool.query(
        "SELECT * FROM users WHERE username = $1",
        [normalizedUsername]
      );
      if (!user[0]) {
        return done(null, false, { message: "Incorrect username" });
      }

      const isValid = await bcrypt.compare(password, user[0].password);

      if (!isValid) {
        return done(null, false, { message: "Incorrect password" });
      }

      return done(null, user[0]);
    } catch (err) {
      return done(err);
    }
  })
);

module.exports = passport;
