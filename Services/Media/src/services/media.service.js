const mongoose = require("mongoose");
const { getBucket } = require("../config/database.config");

const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "video/mp4",
];


function openUploadStream(filename, contentType) {
    return getBucket().openUploadStream(filename, { contentType });
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


function getReadStream(id, options = {}) {
    const bucket = getBucket();
    return bucket.openDownloadStream(new mongoose.Types.ObjectId(id), options);
}

async function deleteImage(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid id");
    }
    const bucket = getBucket();
    await bucket.delete(new mongoose.Types.ObjectId(id));
    return { id };
}

module.exports = {
    ALLOWED_TYPES,
    openUploadStream,
    getFileInfo,
    getReadStream,
    deleteImage,
};
