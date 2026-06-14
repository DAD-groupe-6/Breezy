const mongoose = require("mongoose");

function getBucket() {
    return new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: "media",
    });
}

function uploadImage(file) {
    return new Promise((resolve, reject) => {
        const stream = getBucket().openUploadStream(file.originalname, {
            contentType: file.mimetype,
        });
        stream.on("error", reject);
        stream.on("finish", () => resolve(stream.id));
        stream.end(file.buffer);
    });
}

async function getImage(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Media not found");
    }
    const _id = new mongoose.Types.ObjectId(id);
    const bucket = getBucket();
    const files = await bucket.find({ _id }).toArray();
    if (!files.length) throw new Error("Media not found");

    return {
        stream: bucket.openDownloadStream(_id),
        contentType: files[0].contentType,
    };
}

module.exports = { uploadImage, getImage };
