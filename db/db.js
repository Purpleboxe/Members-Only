const { Pool } = require("pg");
require("dotenv").config();

const bcrypt = require("bcryptjs");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const createUser = async (
  username,
  password,
  role = "non-member",
  ogName = username
) => {
  username = username.toLowerCase();
  const hashedPassword = bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO users (username, password, role, ogName)
    VALUES ($1, $2, $3, $4) RETURNING *`,
    [username, password, role, ogName]
  );
  return result.rows[0];
};

const deleteUserById = async (id) => {
  try {
    await pool.query(`DELETE FROM messages WHERE user_id = $1`, [id]);
    await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
  } catch (err) {
    throw new Error(err);
  }
};

const formatTimestamp = (timestamp) => {
  return DateTime.fromJSDate(new Date(timestamp)).toLocaleString(
    DateTime.DATE_MED
  );
};

module.exports = {
  pool,
  createUser,
  deleteUserById,
  formatTimestamp,
};
