var express = require("express");
var router = express.Router();
const { pool } = require("../db/db");

/* GET home page. */
router.get("/", async function (req, res, next) {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  try {
    const messageQuery = `
      SELECT m.id, m.title, m.text, m.timestamp, u.username, u.og_name
      FROM messages m
      JOIN users u ON m.user_id = u.id
      ORDER BY m.timestamp DESC
      LIMIT $1 OFFSET $2
    `;
    const { rows: messages } = await pool.query(messageQuery, [limit, skip]);

    const totalMessagesResult = await pool.query(
      "SELECT COUNT(*) FROM messages"
    );
    const totalMessages = parseInt(totalMessages.rows[0].count, 10);
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
