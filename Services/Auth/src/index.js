require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const sequelize = require("./config/database.config");
const authRoutes = require("./routes/auth.route");
const logger = require("./logger");
const app = express();
const port = process.env.API_PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

async function startServer() {
  try {
    await sequelize.authenticate();
    logger.info("Connected to DB");
    await sequelize.sync({ alter: true });
    logger.info("Synchronized tables");
    app.listen(port, () => {
      logger.info(`Auth service → http://localhost:${port}`);
    });
  } catch (err) {
    logger.error(`Erreur BDD : ${err.message}`);
  }
}

app.get("/api/v1/auth/health", (req, res) => {
  res.status(200).json({ status: "UP" });
});

app.use("/api/v1/auth", authRoutes);

startServer();