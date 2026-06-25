const { verifyToken } = require("../utils/jwt.util");
const { createMessage, markAsRead } = require("../services/message.service");
const { getConversationById } = require("../services/conversation.service");
const logger = require("../logger");

/**
 * Branche l'authentification du socket (JWT dans le handshake) et tous les événements
 * temps réel (rejoindre/quitter une conversation, lecture, envoi, frappe, déconnexion).
 * Entrée : io (Server socket.io)
 * Sortie : rien
 */
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

        socket.join(`user:${userId}`);

        socket.on("join_conversation", (conversationId) => {
            socket.join(conversationId);
            logger.info(`User ${userId} joined conversation ${conversationId}`);

            socket.to(conversationId).emit("messages_read", {
                conversationId,
                readAt: new Date(),
            });
        });

        socket.on("leave_conversation", (conversationId) => {
            socket.leave(conversationId);
        });

        socket.on("mark_read", async ({ conversationId }) => {
            try {
                if (!conversationId) return;
                await getConversationById(conversationId, userId);
                await markAsRead(conversationId, userId);

                socket.to(conversationId).emit("messages_read", {
                    conversationId,
                    readAt: new Date(),
                });
            } catch (err) {
                socket.emit("error", { message: err.message });
            }
        });

        socket.on("send_message", async ({ conversationId, content }) => {
            try {
                if (!conversationId || !content?.trim()) return;

                const conversation = await getConversationById(conversationId, userId);
                const message = await createMessage(conversationId, userId, content.trim());

                io.to(conversationId).emit("message_received", message);

                for (const participantId of conversation.participants) {
                    io.to(`user:${String(participantId)}`).emit("message_received", message);
                }
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
