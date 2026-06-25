const { Server } = require("socket.io");
const { verifyToken } = require("../utils/jwt.util");
const logger = require("../logger");

let io = null;

/**
 * Initialise Socket.IO : authentifie le handshake via JWT et place chaque client dans sa room.
 * Entrée : httpServer (http.Server)
 * Sortie : io (Server)
 */
function initSocket(httpServer) {
    io = new Server(httpServer, {
        cors: { origin: true, credentials: true },
    });

    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        const decoded = token ? verifyToken(token) : null;
        if (!decoded) return next(new Error("Unauthorized"));
        socket.userId = String(decoded.id);
        next();
    });

    io.on("connection", (socket) => {
        socket.join(socket.userId);
        logger.info(`Socket connecté : user ${socket.userId}`);
    });

    return io;
}

/**
 * Émet un événement vers la room (donc tous les onglets) d'un utilisateur précis.
 * Entrée : userId (string), event (string), payload (object)
 * Sortie : rien
 */
function emitToUser(userId, event, payload) {
    if (!io) return;
    io.to(String(userId)).emit(event, payload);
}

module.exports = { initSocket, emitToUser };
