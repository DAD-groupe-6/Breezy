require("dotenv").config();
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/notification_db";

/**
 * Connecte Mongoose à la base.
 * Entrée : rien (lit MONGO_URI)
 * Sortie : connection (mongoose.Connection)
 */
async function connectDB() {
    await mongoose.connect(MONGO_URI);
    return mongoose.connection;
}

module.exports = connectDB;
