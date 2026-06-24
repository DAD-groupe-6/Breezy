require("dotenv").config();
const express = require("express");
const http = require("http");
const morgan = require("morgan");
const { Server } = require("socket.io");
const connectDB = require("./config/database.config");
const conversationRoutes = require("./routes/conversation.route");
const messageRoutes = require("./routes/message.route");
const { registerSocketHandlers } = require("./sockets/message.socket");
const logger = require("./logger");

const app = express();
const httpServer = http.createServer(app);
const port = process.env.API_PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// --- Routes REST ---
app.get("/api/v1/message/health", (req, res) => {
    res.status(200).json({ status: "UP" });
});
app.use("/api/v1/message/conversations", conversationRoutes);
app.use("/api/v1/message/conversations", messageRoutes);

// --- WebSocket ---
const io = new Server(httpServer, {
    path: "/api/v1/message/socket.io",
    cors: { origin: "*" },
});

registerSocketHandlers(io);

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
