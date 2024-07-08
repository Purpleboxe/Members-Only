var express = require("express");
var router = express.Router();

const message_controller = require("../controllers/messageController");
const { auth } = require("../config/auth");

router.get("/create", auth, message_controller.message_create_get);
router.post("/create", auth, message_controller.message_create_post);

module.exports = router;
