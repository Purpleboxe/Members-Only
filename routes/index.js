var express = require("express");
var router = express.Router();
const { pool, getMessagesWithUser } = require("../db/db");

/* GET home page. */
router.get("/", async function (req, res, next) {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  try {
    const messages = await getMessagesWithUser(limit, skip);

    const totalMessagesResult = await pool.query(
      "SELECT COUNT(*) FROM messages"
    );
    const totalMessages = parseInt(totalMessagesResult.rows[0].count, 10);
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
