const conversationService = require("../services/conversation.service");
const { deleteMessagesByConversation } = require("../services/message.service");

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

async function getConversation(req, res) {
    try {
        const conversation = await conversationService.getConversationById(
            req.params.id,
            String(req.user.id)
        );
        res.status(200).json(conversation);
    } catch (err) {
        if (err.message === "Conversation not found") return res.status(404).json({ message: err.message });
        if (err.message === "Forbidden") return res.status(403).json({ message: err.message });
        res.status(500).json({ message: err.message });
    }
}

async function deleteConversation(req, res) {
    try {
        await conversationService.deleteConversation(req.params.id, String(req.user.id));
        await deleteMessagesByConversation(req.params.id);
        res.status(200).json({ message: "Conversation deleted" });
    } catch (err) {
        if (err.message === "Conversation not found") return res.status(404).json({ message: err.message });
        if (err.message === "Forbidden") return res.status(403).json({ message: err.message });
        res.status(500).json({ message: err.message });
    }
}

module.exports = { listConversations, startConversation, getConversation, deleteConversation };
