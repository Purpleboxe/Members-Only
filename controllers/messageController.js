const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const { pool, createMessage } = require("../db/db");

exports.message_create_get = (req, res, next) => {
  res.render("message_form", { title: "Create Message" });
};

exports.message_create_post = [
  body("title", "Title must be between 3 and 50 characters.")
    .trim()
    .isLength({ min: 3, max: 50 })
    .escape(),
  body("text", "Message text must be between 3 and 255 characters.")
    .trim()
    .isLength({ min: 3, max: 255 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("message_form", {
        title: "Create Message",
        message: req.body,
        errors: errors.array(),
      });
    }

    const message = {
      title: req.body.title,
      text: req.body.text,
      user: req.user.id,
    };

    try {
      createMessage(message.title, message.text, message.user);
      res.redirect("/");
    } catch (err) {
      next(err);
    }
  }),
];

exports.message_delete_get = asyncHandler(async (req, res, next) => {
  try {
    const { rows: message } = await pool.query(
      "SELECT * FROM messages WHERE id = $1",
      [req.params.id]
    );

    if (!message[0]) {
      return res.status(404).send("Message not found!");
    }

    if (req.user.id !== message[0].user_id && req.user.role !== "admin") {
      return res
        .status(403)
        .send("You do not have permission to delete this message");
    }

    await pool.query("DELETE FROM messages WHERE id = $1", [req.params.id]);
    res.redirect("/");
  } catch (err) {
    next(err);
  }
});
