const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth.middleware");
const { requirePermission } = require("../middlewares/permission.middleware");
const { listConversations, startConversation, getConversation, deleteConversation } = require("../controllers/conversation.controller");

router.get("/", authenticate, requirePermission("send_messages"), listConversations);
router.post("/", authenticate, requirePermission("send_messages"), startConversation);
router.get("/:id", authenticate, requirePermission("send_messages"), getConversation);
router.delete("/:id", authenticate, requirePermission("send_messages"), deleteConversation);

module.exports = router;
