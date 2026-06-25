const Message = require("../models/message.model");
const { updateLastMessage } = require("./conversation.service");

/**
 * Crée un message et met à jour l'aperçu du dernier message de la conversation.
 * Entrée : conversationId (string), senderId (string), content (string)
 * Sortie : message (object)
 */
async function createMessage(conversationId, senderId, content) {
    const message = await Message.create({ conversationId, senderId, content });
    await updateLastMessage(conversationId, content);
    return message;
}

/**
 * Renvoie une page de messages d'une conversation, des plus récents aux plus anciens.
 * Entrée : conversationId (string), page (number), limit (number)
 * Sortie : messages (array)
 */
async function getMessages(conversationId, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    return Message.find({ conversationId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
}

/**
 * Marque comme lus les messages d'une conversation non envoyés par l'utilisateur.
 * Entrée : conversationId (string), userId (string)
 * Sortie : rien
 */
async function markAsRead(conversationId, userId) {
    await Message.updateMany(
        { conversationId, senderId: { $ne: userId }, readAt: null },
        { readAt: new Date() }
    );
}

/**
 * Supprime tous les messages d'une conversation.
 * Entrée : conversationId (string)
 * Sortie : rien
 */
async function deleteMessagesByConversation(conversationId) {
    await Message.deleteMany({ conversationId });
}

module.exports = { createMessage, getMessages, markAsRead, deleteMessagesByConversation };
