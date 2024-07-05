const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const passportConfig = require("../config/passport");

exports.signup_get = (req, res, next) => {
  res.render("signup", { title: "Sign Up" });
};

exports.signup_post = [
  body("username")
    .trim()
    .isLength({ min: 3 })
    .escape()
    .withMessage("Username must be at least 3 characters."),
  body("password")
    .trim()
    .isLength({ min: 6 })
    .escape()
    .withMessage("Password must be at least 6 characters."),
  body("confirmPassword")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const { username, password } = req.body;

    if (!errors.isEmpty()) {
      console.error("Validation errors:", errors.array());
      return res.render("signup", {
        title: "Sign Up",
        user: { username },
        errors: errors.array(),
      });
    }

    try {
      console.log("Checking if username exists:", username);
      const userExists = await User.findOne({ username });

      if (userExists) {
        console.log("Username already exists:", username);
        return res.render("signup", {
          title: "Sign Up",
          user: { username },
          errors: [{ msg: "Username already exists." }],
        });
      }

      console.log("Creating new user:", username);
      const newUser = new User({ username });
      if (!(await newUser.generateHash(password))) {
        throw new Error("Failed to set password.");
      }
      await newUser.save();

      console.log("User registered successfully:", username);
      res.redirect("/users/login");
    } catch (err) {
      console.error("Error during signup:", err);
      return next(err);
    }
  }),
];

exports.login_get = (req, res, next) => {
  res.render("login", { title: "Log In" });
};

exports.login_post = (req, res, next) => {
  passportConfig.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      console.log("User authentication failed:", info.message);
      return res.render("login", {
        title: "Log In",
        user: req.body,
        errors: [{ msg: "Invalid username or password." }],
      });
    }

    req.login(user, (err) => {
      if (err) {
        return next(err);
      }

      return res.status(200).redirect("/");
    });
  })(req, res, next);
};
