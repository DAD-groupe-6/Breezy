const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth.middleware");
const { requirePermission } = require("../middlewares/permission.middleware");
const { listConversations, startConversation, getConversation, deleteConversation } = require("../controllers/conversation.controller");

router.get("/", authenticate, requirePermission("private_messages"), listConversations);
router.post("/", authenticate, requirePermission("private_messages"), startConversation);
router.get("/:id", authenticate, requirePermission("private_messages"), getConversation);
router.delete("/:id", authenticate, requirePermission("private_messages"), deleteConversation);

module.exports = router;
