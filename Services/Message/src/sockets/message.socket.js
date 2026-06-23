const { verifyToken } = require("../utils/jwt.util");
const { createMessage } = require("../services/message.service");
const { getConversationById } = require("../services/conversation.service");
const logger = require("../logger");

function registerSocketHandlers(io) {
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error("No token provided"));

        const decoded = verifyToken(token);
        if (!decoded) return next(new Error("Invalid or expired token"));

        socket.user = decoded;
        next();
    });

    io.on("connection", (socket) => {
        const userId = String(socket.user.id);
        logger.info(`User ${userId} connected via WebSocket`);

        // Each user joins their personal room to receive notifications
        socket.join(`user:${userId}`);

        socket.on("join_conversation", (conversationId) => {
            socket.join(conversationId);
            logger.info(`User ${userId} joined conversation ${conversationId}`);
        });

        socket.on("leave_conversation", (conversationId) => {
            socket.leave(conversationId);
        });

        socket.on("send_message", async ({ conversationId, content }) => {
            try {
                if (!conversationId || !content?.trim()) return;

                await getConversationById(conversationId, userId);

                const message = await createMessage(conversationId, userId, content.trim());

                io.to(conversationId).emit("message_received", message);

                // Also notify participants who are not in the room (personal room)
                io.to(`user:${userId}`).emit("message_sent", message);
            } catch (err) {
                socket.emit("error", { message: err.message });
            }
        });

        socket.on("typing", ({ conversationId }) => {
            if (!conversationId) return;
            socket.to(conversationId).emit("typing_indicator", { userId, conversationId });
        });

        socket.on("disconnect", () => {
            logger.info(`User ${userId} disconnected`);
        });
    });
}

module.exports = { registerSocketHandlers };
