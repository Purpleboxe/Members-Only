const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const passportConfig = require("../config/passport");
const Message = require("../models/message");

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
        throw new Error("Passwords do not match.");
      }
      return true;
    }),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    let { username, password } = req.body;

    let ogName = username;
    username = username.toLowerCase();

    if (!errors.isEmpty()) {
      console.error("Validation errors:", errors.array());
      return res.render("signup", {
        title: "Sign Up",
        username: { ogName },
        errors: errors.array(),
      });
    }

    try {
      console.log("Checking if username exists:", ogName);
      const userExists = await User.findOne({ username });

      if (userExists) {
        console.log("Username already exists:", username);
        return res.render("signup", {
          title: "Sign Up",
          username: { ogName },
          errors: [{ msg: "Username already exists." }],
        });
      }

      console.log("Creating new user:", ogName);
      const newUser = new User({ username, ogName });
      if (!(await newUser.generateHash(password))) {
        throw new Error("Failed to set password.");
      }
      await newUser.save();

      console.log("User registered successfully:", ogName);
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

exports.logout_get = (req, res, next) => {
  res.render("logout", { title: "Log Out" });
};

exports.logout_post = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
};

exports.user_detail = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (user === null) {
    const err = new Error("User not found!");
    err.status = 404;
    return next(err);
  }

  const messages = await Message.find({ user: user._id }).sort({
    timestamp: -1,
  });
  const messageCount = messages.length;

  res.render("profile", {
    title: user.ogName + "'s Profile",
    currentUser: user,
    messageCount: messageCount,
    messages: messages,
  });
});

exports.settings_get = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (user === null) {
    const err = new Error("User not found!");
    err.status = 404;
    return next(err);
  }

  res.render("settings", {
    title: "Settings",
    currentUser: user,
    errors: [],
  });
});

exports.settings_post = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const memberPassword = process.env.MEMBER_PASSWORD;

  if (!user) {
    const err = new Error("User not found!");
    err.status = 404;
    return next(err);
  }

  if (req.body.memberPassword === memberPassword) {
    user.role = "member";
    await user.save();
    res.redirect(user.url);
  } else {
    res.render("settings", {
      title: "Settings",
      user: req.user,
      currentUser: user,
      errors: [{ msg: "Incorrect password for membership upgrade." }],
    });
  }
});

exports.deleteAllMessages = async (req, res) => {
  const userID = req.params.id;
  try {
    await Message.deleteMany({ user: userID });
    res.redirect(`/users/${userID}/profile/settings`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting messages");
  }
};

exports.deleteUser = async (req, res) => {
  const userID = req.params.id;
  try {
    await Message.deleteMany({ user: userID });
    await User.findByIdAndDelete(userID);
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting user");
  }
};
