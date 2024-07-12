var express = require("express");
var router = express.Router();

const user_controller = require("../controllers/userController");
const { auth, notAuth } = require("../config/auth");

router.get("/signup", auth, user_controller.signup_get);
router.post("/signup", auth, user_controller.signup_post);

router.get("/login", auth, user_controller.login_get);
router.post("/login", auth, user_controller.login_post);

router.get("/logout", notAuth, user_controller.logout_get);
router.post("/logout", notAuth, user_controller.logout_post);

router.get("/:id/profile", user_controller.user_detail);

module.exports = router;
