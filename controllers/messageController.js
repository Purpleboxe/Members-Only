const Message = require("../models/message");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

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

    const message = new Message({
      title: req.body.title,
      text: req.body.text,
      user: req.user,
    });

    await message.save();
    res.redirect("/");
  }),
];

exports.message_delete_get = asyncHandler(async (req, res, next) => {
  const message = await Message.findById(req.params.id).exec();

  if (!message) {
    return res.status(404).send("Message not found!");
  }

  if (
    req.user._id.toString() !== message.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return res
      .status(403)
      .send("You do not have permission to delete this message");
  }

  await Message.findByIdAndDelete(req.params.id);
  res.redirect("/");
});
