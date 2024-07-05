const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minLength: 3,
    maxLength: 50,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["non-member", "member", "admin"],
    default: "non-member",
  },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
