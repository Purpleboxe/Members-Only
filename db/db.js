const { Pool } = require("pg");
require("dotenv").config();

const bcrypt = require("bcryptjs");
const { DateTime } = require("luxon");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const createUser = async (username, password, role, ogName) => {
  const lowerCaseUsername = username.toLowerCase();
  const hashedPassword = await bcrypt.hash(password, 10);
  const formattedTimestamp = DateTime.now().toFormat("MMMM d, yyyy");

  const result = await pool.query(
    `INSERT INTO users (username, password, role, "og_name", "formatted_timestamp")
    VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [lowerCaseUsername, hashedPassword, role, ogName, formattedTimestamp]
  );

  const userID = result.rows[0].id;
  const userURL = `/users/${userID}/profile`;

  await pool.query(`UPDATE users SET user_url = $1 WHERE id = $2`, [
    userURL,
    userID,
  ]);

  const updatedUserResult = await pool.query(
    `SELECT * FROM users WHERE id = $1`,
    [userID]
  );

  return updatedUserResult.rows[0];
};

const deleteUserById = async (id) => {
  try {
    await pool.query(`DELETE FROM messages WHERE user_id = $1`, [id]);
    await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
  } catch (err) {
    throw new Error(err);
  }
};

const createMessage = async (title, text, user) => {
  const formattedTimestamp = DateTime.now().toFormat("MMMM d, yyyy");

  const result = await pool.query(
    "INSERT INTO messages (title, text, user_id, formatted_timestamp) VALUES ($1, $2, $3, $4) RETURNING *",
    [title, text, user, formattedTimestamp]
  );
  return result.rows[0];
};

const getMessagesWithUser = async (limit, skip) => {
  const result = await pool.query(
    `
    SELECT 
      m.id AS message_id, 
      m.title, 
      m.text, 
      m.formatted_timestamp,
      u.username, 
      u.og_name, 
      u.role,
      u.user_url,
      u.id
    FROM messages m
    JOIN users u ON m.user_id = u.id
    ORDER BY m.timestamp DESC
    LIMIT $1 OFFSET $2
  `,
    [limit, skip]
  );

  return result.rows;
};

module.exports = {
  pool,
  createUser,
  deleteUserById,
  createMessage,
  getMessagesWithUser,
};
