var express = require("express");
var router = express.Router();

const user_controller = require("../controllers/userController");

router.get("/signup", user_controller.signup_get);
router.post("/signup", user_controller.signup_post);

router.get("/login", user_controller.login_get);
router.post("/login", user_controller.login_post);

router.get("/logout", user_controller.logout_get);
router.post("/logout", user_controller.logout_post);

module.exports = router;
