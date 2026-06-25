require("dotenv").config();
const mongoose = require("mongoose");
const logger = require("../logger");

let bucket;

/**
 * Connecte Mongo et prépare le bucket GridFS "media".
 * Entrée : rien (lit MONGO_URI)
 * Sortie : rien
 */
async function connectDB() {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info("Connected to MongoDB");

    const { GridFSBucket } = require("mongodb");
    bucket = new GridFSBucket(mongoose.connection.db, {
        bucketName: "media",
    });
    logger.info("GridFS bucket ready");
}

/**
 * Renvoie le bucket GridFS initialisé.
 * Entrée : rien
 * Sortie : bucket (GridFSBucket)
 */
function getBucket() {
    if (!bucket) throw new Error("GridFS bucket not initialized");
    return bucket;
}

module.exports = { connectDB, getBucket };