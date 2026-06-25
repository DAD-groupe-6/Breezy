const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth.middleware");
const { requirePermission } = require("../middlewares/permission.middleware");
const { getMessages, markAsRead } = require("../controllers/message.controller");

router.get("/:id/messages", authenticate, requirePermission("send_messages"), getMessages);
router.put("/:id/read", authenticate, requirePermission("send_messages"), markAsRead);

module.exports = router;
