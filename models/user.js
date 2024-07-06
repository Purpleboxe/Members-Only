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

UserSchema.pre("save", function (next) {
  this.username = this.username.toLowerCase();
  next();
});

UserSchema.methods.generateHash = async function (password) {
  try {
    this.password = await bcrypt.hash(password, 10);
    return true;
  } catch (err) {
    throw new Error(err);
  }
};

UserSchema.methods.validatePassword = async function (password) {
  try {
    const match = await bcrypt.compare(password, this.password);
    return !!match;
  } catch (err) {
    throw new Error(err);
  }
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
