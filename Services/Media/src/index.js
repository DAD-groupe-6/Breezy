require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const { connectDB } = require("./config/database.config");
const mediaRoutes = require("./routes/media.route");
const logger = require("./logger");

const app = express();
const port = process.env.API_PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/api/v1/media/health", (req, res) => {
    res.status(200).json({ status: "UP" });
});
app.use("/api/v1/media", mediaRoutes);

async function startServer() {
    try {
        await connectDB();
        app.listen(port, () => {
            logger.info(`Media service → http://localhost:${port}`);
        });
    } catch (err) {
        logger.error(`Erreur BDD : ${err.message}`);
    }
}

startServer();
