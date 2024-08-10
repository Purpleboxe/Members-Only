const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const passportConfig = require("../config/passport");
const { pool, createUser, deleteUserById } = require("../db/db");

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
      const { rows: userExists } = await pool.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
      );

      if (userExists[0]) {
        console.log("Username already exists:", username);
        return res.render("signup", {
          title: "Sign Up",
          username: { ogName },
          errors: [{ msg: "Username already exists." }],
        });
      }

      console.log("Creating new user:", ogName);
      createUser(username, password, "non-member", ogName);

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
  const { rows: user } = await pool.query("SELECT * FROM users WHERE id = $1", [
    req.params.id,
  ]);

  if (!user[0]) {
    const err = new Error("User not found!");
    err.status = 404;
    return next(err);
  }

  const { rows: messages } = await pool.query(
    "SELECT * FROM messages WHERE user_id = $1 ORDER BY timestamp DESC",
    [user[0].id]
  );
  const messageCount = messages.length;

  res.render("profile", {
    title: user[0].og_name + "'s Profile",
    currentUser: user[0],
    messageCount: messageCount,
    messages: messages,
  });
});

exports.settings_get = asyncHandler(async (req, res, next) => {
  const { rows: user } = await pool.query(`SELECT * FROM users WHERE id = $1`, [
    req.params.id,
  ]);

  if (!user[0]) {
    const err = new Error("User not found!");
    err.status = 404;
    return next(err);
  }

  res.render("settings", {
    title: "Settings",
    currentUser: user[0],
    errors: [],
  });
});

exports.settings_post = asyncHandler(async (req, res, next) => {
  const { rows: user } = await pool.query(`SELECT * FROM users WHERE id = $1`, [
    req.user.id,
  ]);
  const memberPassword = process.env.MEMBER_PASSWORD;

  if (!user[0]) {
    const err = new Error("User not found!");
    err.status = 404;
    return next(err);
  }

  if (req.body.memberPassword === memberPassword) {
    await pool.query("UPDATE users SET role = 'member' WHERE id = $1", [
      user[0].id,
    ]);
    res.redirect(`/users/${user[0].id}/profile`);
  } else {
    res.render("settings", {
      title: "Settings",
      user: req.user,
      currentUser: user[0],
      errors: [{ msg: "Incorrect password for membership upgrade." }],
    });
  }
});

exports.deleteAllMessages = async (req, res) => {
  const userID = req.params.id;
  try {
    await pool.query("DELETE FROM messages WHERE user_id = $1", [userID]);
    res.redirect(`/users/${userID}/profile/settings`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting messages");
  }
};

exports.deleteUser = async (req, res) => {
  const userID = req.params.id;
  try {
    deleteUserById(userID);
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting user");
  }
};

exports.search_users = asyncHandler(async (req, res, next) => {
  const searchQuery = req.query.username;
  let users;

  if (searchQuery) {
    const regex = `%${searchQuery}%`;
    const { rows } = await pool.query(
      `SELECT * FROM users WHERE username ILIKE $1`,
      [regex]
    );
    users = rows;
  } else {
    const { rows } = await pool.query(`SELECT * FROM users`);
    users = rows;
  }

  res.render("user_list", {
    title: "User List",
    users: users,
  });
});
