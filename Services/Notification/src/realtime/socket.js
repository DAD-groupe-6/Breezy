const { Server } = require("socket.io");
const { verifyToken } = require("../utils/jwt.util");
const logger = require("../logger");

let io = null;

function initSocket(httpServer) {
    io = new Server(httpServer, {
        cors: { origin: true, credentials: true },
    });

    // Auth du handshake : le client envoie son JWT dans socket.handshake.auth.token
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        const decoded = token ? verifyToken(token) : null;
        if (!decoded) return next(new Error("Unauthorized"));
        socket.userId = String(decoded.id);
        next();
    });

    io.on("connection", (socket) => {
        socket.join(socket.userId); // une room par utilisateur
        logger.info(`Socket connecté : user ${socket.userId}`);
    });

    return io;
}

// Émet un événement vers la room d'un utilisateur précis.
function emitToUser(userId, event, payload) {
    if (!io) return;
    io.to(String(userId)).emit(event, payload);
}

module.exports = { initSocket, emitToUser };
