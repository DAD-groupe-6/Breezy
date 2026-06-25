require("dotenv").config();
const express = require("express");
const http = require("http");
const morgan = require("morgan");
const { Server } = require("socket.io");
const connectDB = require("./config/database.config");
const conversationRoutes = require("./routes/conversation.route");
const messageRoutes = require("./routes/message.route");
const { registerSocketHandlers } = require("./sockets/message.socket");
const { corsOptions } = require("./utils/cors.util");
const logger = require("./logger");

const app = express();
const httpServer = http.createServer(app);
const port = process.env.API_PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/api/v1/message/health", (req, res) => {
    res.status(200).json({ status: "UP" });
});
app.use("/api/v1/message/conversations", conversationRoutes);
app.use("/api/v1/message/conversations", messageRoutes);

const io = new Server(httpServer, {
    path: "/api/v1/message/socket.io",
    cors: corsOptions,
});

registerSocketHandlers(io);

/**
 * Connecte la base puis démarre le serveur HTTP (+ WebSocket).
 * Entrée : rien
 * Sortie : rien (écoute sur le port configuré)
 */
async function startServer() {
    try {
        await connectDB();
        logger.info("Connected to MongoDB");
        httpServer.listen(port, () => {
            logger.info(`Message service → http://localhost:${port}`);
        });
    } catch (err) {
        logger.error(`Erreur BDD : ${err.message}`);
        process.exit(1);
    }
}

startServer();
