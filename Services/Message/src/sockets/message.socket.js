const { verifyToken } = require("../utils/jwt.util");
const { createMessage, markAsRead } = require("../services/message.service");
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

        socket.join(`user:${userId}`);

        socket.on("join_conversation", (conversationId) => {
            socket.join(conversationId);
            logger.info(`User ${userId} joined conversation ${conversationId}`);

            // Notifie les autres participants que ce user a lu la conversation
            socket.to(conversationId).emit("messages_read", {
                conversationId,
                readAt: new Date(),
            });
        });

        socket.on("leave_conversation", (conversationId) => {
            socket.leave(conversationId);
        });

        // Marque les messages reçus comme lus alors que la conversation est
        // déjà ouverte (un message arrivé en direct n'est plus "non lu") et
        // notifie l'expéditeur pour basculer ses messages en ✓✓.
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
