require("dotenv").config();
const mongoose = require("mongoose");
const logger = require("../logger");

let bucket;

async function connectDB() {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info("Connected to MongoDB");

    const { GridFSBucket } = require("mongodb");
    bucket = new GridFSBucket(mongoose.connection.db, {
        bucketName: "media",
    });
    logger.info("GridFS bucket ready");
}

function getBucket() {
    if (!bucket) throw new Error("GridFS bucket not initialized");
    return bucket;
}

module.exports = { connectDB, getBucket };