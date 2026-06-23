const conversationService = require("../services/conversation.service");

async function listConversations(req, res) {
    try {
        const conversations = await conversationService.getUserConversations(String(req.user.id));
        res.status(200).json(conversations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

async function startConversation(req, res) {
    try {
        const { recipientId } = req.body;
        if (!recipientId) return res.status(400).json({ message: "recipientId is required" });
        if (String(recipientId) === String(req.user.id)) {
            return res.status(400).json({ message: "Cannot start a conversation with yourself" });
        }

        const conversation = await conversationService.getOrCreateConversation(
            String(req.user.id),
            String(recipientId)
        );
        res.status(200).json(conversation);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

module.exports = { listConversations, startConversation };
