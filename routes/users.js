var express = require("express");
var router = express.Router();

const user_controller = require("../controllers/userController");

router.get("/signup", user_controller.signup_get);

router.post("/signup", user_controller.signup_post);

module.exports = router;
