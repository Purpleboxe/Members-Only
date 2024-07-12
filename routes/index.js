var express = require("express");
var router = express.Router();

const Message = require("../models/message");

/* GET home page. */
router.get("/", async function (req, res, next) {
  let messages = await Message.find().populate("user").exec();
  messages = messages.filter((message) => message.user);
  res.render("index", {
    title: "Members Only",
    user: req.user,
    messages: messages,
  });
});

module.exports = router;
