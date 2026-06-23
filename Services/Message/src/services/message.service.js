const Message = require("../models/message.model");
const { updateLastMessage } = require("./conversation.service");

async function createMessage(conversationId, senderId, content) {
    const message = await Message.create({ conversationId, senderId, content });
    await updateLastMessage(conversationId, content);
    return message;
}

async function getMessages(conversationId, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    return Message.find({ conversationId })
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit);
}

async function markAsRead(conversationId, userId) {
    await Message.updateMany(
        { conversationId, senderId: { $ne: userId }, readAt: null },
        { readAt: new Date() }
    );
}

async function deleteMessagesByConversation(conversationId) {
    await Message.deleteMany({ conversationId });
}

module.exports = { createMessage, getMessages, markAsRead, deleteMessagesByConversation };
