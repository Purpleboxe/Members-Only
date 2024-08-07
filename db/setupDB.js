const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const createUserTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL CHECK (char_length(username) >= 3),
        password VARCHAR(255) NOT NULL,
        role VARCHAR(10) DEFAULT 'non-member' CHECK (role IN ('non-member', 'member', 'admin')),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        og_name VARCHAR(255)
    );
`;

const createMessageTableQuery = `
    CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        title VARCHAR(50) NOT NULL CHECK (char_length(title) >= 3),
        text VARCHAR(255) NOT NULL CHECK (char_length(text) >= 3),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_id INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
`;

const createTables = async () => {
  try {
    await pool.query(createUserTableQuery);
    await pool.query(createMessageTableQuery);
    console.log("Tables created successfully.");
  } catch (err) {
    console.error("Error creating tables:", err);
  } finally {
    pool.end();
  }
};

createTables();
