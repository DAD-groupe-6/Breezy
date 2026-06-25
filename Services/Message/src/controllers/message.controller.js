const messageService = require("../services/message.service");
const conversationService = require("../services/conversation.service");

/**
 * Renvoie les messages d'une conversation (paginés, récents d'abord).
 * Entrée : req.params.id (string), req.query { page, limit }, req.user.id (string)
 * Sortie : 200 messages (array) ; 404 si introuvable, 403 si non participant, 500 sinon
 */
async function getMessages(req, res) {
    try {
        const { id } = req.params;
        await conversationService.getConversationById(id, String(req.user.id));

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const messages = await messageService.getMessages(id, page, limit);
        res.status(200).json(messages);
    } catch (err) {
        if (err.message === "Conversation not found") return res.status(404).json({ message: err.message });
        if (err.message === "Forbidden") return res.status(403).json({ message: err.message });
        res.status(500).json({ message: err.message });
    }
}

/**
 * Marque comme lus les messages reçus dans une conversation.
 * Entrée : req.params.id (string), req.user.id (string)
 * Sortie : 200 { message } ; 404 si introuvable, 403 si non participant, 500 sinon
 */
async function markAsRead(req, res) {
    try {
        const { id } = req.params;
        await conversationService.getConversationById(id, String(req.user.id));
        await messageService.markAsRead(id, String(req.user.id));
        res.status(200).json({ message: "Messages marked as read" });
    } catch (err) {
        if (err.message === "Conversation not found") return res.status(404).json({ message: err.message });
        if (err.message === "Forbidden") return res.status(403).json({ message: err.message });
        res.status(500).json({ message: err.message });
    }
}

module.exports = { getMessages, markAsRead };
