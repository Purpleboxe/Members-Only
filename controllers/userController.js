const User = require("../models/user");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

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
      return res.render("signup", {
        title: "Sign Up",
        user: { username },
        errors: errors.array(),
      });
    }

    try {
      const userExists = await User.findOne({ username });

      if (userExists) {
        return res.render("signup", {
          title: "Sign Up",
          user: { username },
          errors: [{ msg: "Username already exists." }],
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = new User({
        username,
        password: hashedPassword,
      });

      await newUser.save();
      res.redirect("/");
    } catch (err) {
      return next(err);
    }
  }),
];
