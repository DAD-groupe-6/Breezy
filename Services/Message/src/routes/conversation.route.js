const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth.middleware");
const { listConversations, startConversation, getConversation, deleteConversation } = require("../controllers/conversation.controller");

router.get("/", authenticate, listConversations);
router.post("/", authenticate, startConversation);
router.get("/:id", authenticate, getConversation);
router.delete("/:id", authenticate, deleteConversation);

module.exports = router;
