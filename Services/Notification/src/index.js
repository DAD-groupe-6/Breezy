require("dotenv").config();
const http = require("http");
const express = require("express");
const morgan = require("morgan");
const connectDB = require("./config/database.config");
const notificationRoutes = require("./routes/notification.route");
const { initSocket } = require("./realtime/socket");
const { startNotificationConsumer } = require("./messaging/consumer");
const logger = require("./logger");

const app = express();
const port = process.env.API_PORT || 3000;

app.use(express.json());
app.use(morgan("dev"));

app.get("/api/v1/notifications/health", (req, res) => {
    res.status(200).json({ status: "UP" });
});
app.use("/api/v1/notifications", notificationRoutes);

const server = http.createServer(app);
initSocket(server);

async function startServer() {
    try {
        await connectDB();
        logger.info("Connected to MongoDB");
        await startNotificationConsumer();
        server.listen(port, () => {
            logger.info(`Notification service → http://localhost:${port}`);
        });
    } catch (err) {
        logger.error(`Erreur démarrage : ${err.message}`);
    }
}

startServer();
