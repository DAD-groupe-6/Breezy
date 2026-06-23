const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth.middleware");
const { listConversations, startConversation } = require("../controllers/conversation.controller");

router.get("/", authenticate, listConversations);
router.post("/", authenticate, startConversation);

module.exports = router;
