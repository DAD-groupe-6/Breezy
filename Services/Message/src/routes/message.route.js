const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth.middleware");
const { getMessages, markAsRead } = require("../controllers/message.controller");

router.get("/:id/messages", authenticate, getMessages);
router.put("/:id/read", authenticate, markAsRead);

module.exports = router;
