var express = require("express");
var router = express.Router();
const Message = require("../models/message");

/* GET home page. */
router.get("/", async function (req, res, next) {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  try {
    let messages = await Message.find()
      .populate("user")
      .skip(skip)
      .limit(limit)
      .sort({ timestamp: -1 })
      .exec();

    messages = messages.filter((message) => message.user);

    const totalMessages = await Message.countDocuments();
    const totalPages = Math.ceil(totalMessages / limit);

    res.render("index", {
      title: "Members Only",
      messages,
      page,
      totalPages,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
