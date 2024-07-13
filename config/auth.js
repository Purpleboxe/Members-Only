const User = require("../models/user");

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
        const user = await User.findById(req.user._id);
        if (!user) {
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
    if (req.user && req.user._id.equals(req.params.id)) {
      next();
    } else {
      res.status(403).send("Forbidden");
    }
  },
};
