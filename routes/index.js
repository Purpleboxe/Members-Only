var express = require("express");
var router = express.Router();

const Message = require("../models/message");

/* GET home page. */
router.get("/", async function (req, res, next) {
  try {
    let messages = await Message.find()
      .populate("user")
      .sort({ timestamp: -1 })
      .exec();

    messages = messages.filter((message) => message.user);

    res.render("index", {
      title: "Members Only",
      messages: messages,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
