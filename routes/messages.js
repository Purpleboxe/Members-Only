var express = require("express");
var router = express.Router();

const message_controller = require("../controllers/messageController");
const { notAuth } = require("../config/auth");

router.get("/create", notAuth, message_controller.message_create_get);
router.post("/create", notAuth, message_controller.message_create_post);

router.get("/:id/delete", notAuth, message_controller.message_delete_get);

module.exports = router;
