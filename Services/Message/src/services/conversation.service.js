const Conversation = require("../models/conversation.model");
const Message = require("../models/message.model");

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

async function getConversationById(conversationId, userId) {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) throw new Error("Conversation not found");
    if (!conversation.participants.includes(userId)) throw new Error("Forbidden");
    return conversation;
}

async function updateLastMessage(conversationId, content) {
    await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: content,
        lastMessageAt: new Date(),
    });
}

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
