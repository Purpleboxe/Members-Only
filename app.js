var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const passport = require("passport");
const session = require("express-session");
const crypto = require("crypto");

const secret = crypto.randomBytes(64).toString("hex");

// Import routes
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const messagesRouter = require("./routes/messages");

const { checkUserExists } = require("./config/auth");

var app = express();

const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 50,
  message: "Too many requests, please try again later.",
});

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Middleware setup
app.use(logger("dev")); // HTTP request logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded bodies
app.use(cookieParser()); // Parse cookies
app.use(express.static(path.join(__dirname, "public"))); // Serve static files from 'public' directory
app.use(limiter);

// Session middleware setup
app.use(
  session({
    secret: secret,
    resave: false,
    saveUninitialized: false,
    // Add more options as needed (e.g., secure: true for HTTPS)
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Middleware to set user in locals
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// Mount routes
app.use("/", indexRouter); // Mount indexRouter for '/'
app.use("/users", usersRouter); // Mount usersRouter for '/users'
app.use("/messages", checkUserExists, messagesRouter);

// Handle 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
