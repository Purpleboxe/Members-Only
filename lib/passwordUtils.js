const bcrypt = require("bcryptjs");

async function generateHash(password) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

async function validatePassword(password, hash) {
  const match = await bcrypt.compare(password, hash);
  return match;
}

module.exports.validatePassword = validatePassword;
module.exports.generateHash = generateHash;
