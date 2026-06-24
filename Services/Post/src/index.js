require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const connectDB = require("./config/database.config");
const { connectPublisher } = require("./messaging/publisher");
const postRoutes = require("./routes/post.route");
const recommendationRoutes = require("./routes/recommendation.route");
const logger = require("./logger");

const app = express();
const port = process.env.API_PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// --- Documentation Swagger ---
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API Post Service",
            version: "1.0.0",
            description: "Documentation du service de post",
        },
        servers: [{ url: "http://localhost/api/v1/post" }],
    },
    apis: ["./src/routes/*.js"],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api/v1/post/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- Routes ---
app.get("/api/v1/post/health", (req, res) => {
    res.status(200).json({ status: "UP" });
});
app.use("/api/v1/post", postRoutes);
app.use("/api/v1/post/recommendations", recommendationRoutes);

async function startServer() {
    try {
        await connectDB();
        logger.info("Connected to MongoDB");
        await connectPublisher();
        app.listen(port, () => {
            logger.info(`Post service → http://localhost:${port}`);
        });
    } catch (err) {
        logger.error(`Erreur BDD : ${err.message}`);
    }
}

startServer();
