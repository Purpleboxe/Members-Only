var express = require("express");
var router = express.Router();

const user_controller = require("../controllers/userController");
const { auth, notAuth, checkOwnership } = require("../config/auth");

router.get("/signup", auth, user_controller.signup_get);
router.post("/signup", auth, user_controller.signup_post);

router.get("/login", auth, user_controller.login_get);
router.post("/login", auth, user_controller.login_post);

router.get("/logout", notAuth, user_controller.logout_get);
router.post("/logout", notAuth, user_controller.logout_post);

router.get("/:id/profile", notAuth, user_controller.user_detail);
router.get(
  "/:id/profile/settings",
  notAuth,
  checkOwnership,
  user_controller.settings_get
);
router.post(
  "/:id/profile/settings",
  notAuth,
  checkOwnership,
  user_controller.settings_post
);

router.post("/:id/messages/delete", user_controller.deleteAllMessages);

router.post("/:id/delete", user_controller.deleteUser);

module.exports = router;
