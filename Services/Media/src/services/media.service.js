const mongoose = require("mongoose");
const { getBucket } = require("../config/database.config");

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function uploadImage(file) {
    return new Promise((resolve, reject) => {
        if (!file) return reject(new Error("No file provided"));
        if (!ALLOWED_TYPES.includes(file.mimetype)) {
            return reject(new Error("Invalid file type"));
        }

        const bucket = getBucket();

        const uploadStream = bucket.openUploadStream(file.originalname, {
            contentType: file.mimetype,
        });

        uploadStream.end(file.buffer);

        uploadStream.on("finish", () => {
            resolve(uploadStream.id);
        });
        uploadStream.on("error", (err) => {
            reject(err);
        });
    });
}

async function getFileInfo(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid id");
    }
    const bucket = getBucket();
    const files = await bucket
        .find({ _id: new mongoose.Types.ObjectId(id) })
        .toArray();

    if (!files || files.length === 0) {
        throw new Error("File not found");
    }
    return files[0];
}

function getReadStream(id) {
    const bucket = getBucket();
    return bucket.openDownloadStream(new mongoose.Types.ObjectId(id));
}

async function deleteImage(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid id");
    }
    const bucket = getBucket();
    await bucket.delete(new mongoose.Types.ObjectId(id));
    return { id };
}

module.exports = { uploadImage, getFileInfo, getReadStream, deleteImage };