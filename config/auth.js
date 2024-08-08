const { pool } = require("../db/db");

module.exports = {
  auth: function (req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect("/");
    }
    return next();
  },

  notAuth: function (req, res, next) {
    if (!req.isAuthenticated()) {
      return res.redirect("/");
    }
    return next();
  },

  checkUserExists: async function (req, res, next) {
    if (req.isAuthenticated()) {
      try {
        const { rows: user } = await pool.query(
          "SELECT * FROM users WHERE id = $1",
          [req.user.id]
        );
        if (!user[0]) {
          req.logout((err) => {
            if (err) {
              return next(err);
            }
            req.session.destroy((err) => {
              if (err) {
                return next(err);
              }
              res.redirect("/users/login");
            });
          });
        } else {
          next();
        }
      } catch (err) {
        next(err);
      }
    } else {
      next();
    }
  },

  checkOwnership: function (req, res, next) {
    if (req.isAuthenticated() && req.user.id === parseInt(req.params.id, 10)) {
      next();
    } else {
      res.status(403).send("Forbidden");
    }
  },
};
