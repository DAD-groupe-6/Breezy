const Conversation = require("../models/conversation.model");
const Message = require("../models/message.model");

/**
 * Retrouve la conversation entre deux utilisateurs ou la crée si elle n'existe pas.
 * Entrée : userId (string), recipientId (string)
 * Sortie : conversation (object)
 */
async function getOrCreateConversation(userId, recipientId) {
    const sorted = [userId, recipientId].sort();

    let conversation = await Conversation.findOne({
        participants: { $all: sorted, $size: 2 },
    });

    if (!conversation) {
        conversation = await Conversation.create({ participants: sorted });
    }

    return conversation;
}

/**
 * Liste les conversations d'un utilisateur, triées par dernier message, avec le nombre de non-lus.
 * Entrée : userId (string)
 * Sortie : conversations (array) [{ ...conversation, unreadCount }]
 */
async function getUserConversations(userId) {
    const conversations = await Conversation.find({ participants: userId })
        .sort({ lastMessageAt: -1 });

    return Promise.all(
        conversations.map(async (conv) => {
            const unreadCount = await Message.countDocuments({
                conversationId: conv._id,
                senderId: { $ne: userId },
                readAt: null,
            });
            return { ...conv.toObject(), unreadCount };
        })
    );
}

/**
 * Récupère une conversation en vérifiant que l'utilisateur en est participant.
 * Entrée : conversationId (string), userId (string)
 * Sortie : conversation (object) ; throw "Conversation not found" / "Forbidden"
 */
async function getConversationById(conversationId, userId) {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) throw new Error("Conversation not found");
    if (!conversation.participants.includes(userId)) throw new Error("Forbidden");
    return conversation;
}

/**
 * Met à jour l'aperçu du dernier message d'une conversation.
 * Entrée : conversationId (string), content (string)
 * Sortie : rien
 */
async function updateLastMessage(conversationId, content) {
    await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: content,
        lastMessageAt: new Date(),
    });
}

/**
 * Supprime une conversation après vérification que l'utilisateur en est participant.
 * Entrée : conversationId (string), userId (string)
 * Sortie : rien ; throw "Conversation not found" / "Forbidden"
 */
async function deleteConversation(conversationId, userId) {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) throw new Error("Conversation not found");
    if (!conversation.participants.includes(userId)) throw new Error("Forbidden");
    await Conversation.findByIdAndDelete(conversationId);
}

module.exports = {
    getOrCreateConversation,
    getUserConversations,
    getConversationById,
    updateLastMessage,
    deleteConversation,
};
