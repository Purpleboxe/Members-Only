const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");
const Message = require("./message");

const { DateTime } = require("luxon");

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
  timestamp: {
    type: Date,
    default: Date.now,
  },
  ogName: {
    type: String,
    trim: true,
  },
});

UserSchema.virtual("url").get(function () {
  return `/users/${this._id}/profile`;
});

UserSchema.virtual("formattedTimestamp").get(function () {
  return DateTime.fromJSDate(this.timestamp).toLocaleString(DateTime.DATE_MED);
});

UserSchema.pre("save", function (next) {
  this.username = this.username.toLowerCase();
  next();
});

UserSchema.pre("remove", async function (next) {
  try {
    await Message.deleteMany({ user: this._id });
    next();
  } catch (err) {
    next(err);
  }
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
