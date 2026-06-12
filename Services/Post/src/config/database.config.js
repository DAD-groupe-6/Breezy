require("dotenv").config();
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/post_db";

async function connectDB() {
    await mongoose.connect(MONGO_URI);
    return mongoose.connection;
}

module.exports = connectDB;
