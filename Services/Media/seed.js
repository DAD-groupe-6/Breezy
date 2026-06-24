require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const { connectDB, getBucket } = require("./src/config/database.config");

// --- Identifiants média FIXES (DOIVENT rester synchronisés avec Services/Post/seed.js et Services/User/seed.js) ---
// Chaque fichier de seed-assets est inséré dans GridFS avec un _id déterministe, que Post/User référencent.
const objId = (n) => String(n).padStart(24, "0");
const AVATAR_IDS = Array.from({ length: 12 }, (_, i) => objId(1 + i)); // avatars/avatar1..12.jpg
const POST_IMAGE_IDS = Array.from({ length: 30 }, (_, i) => objId(101 + i)); // images/image1..30.jpg
const POST_VIDEO_IDS = Array.from({ length: 6 }, (_, i) => objId(201 + i)); // videos/video1..6.mp4

// Contenu de démonstration : uniquement en environnement de test.
const IS_TEST_DATASET = process.env.SEED_DATASET === "test";

const ASSETS_DIR = path.join(__dirname, "seed-assets");
const groups = [
    { dir: "avatars", ids: AVATAR_IDS, contentType: "image/jpeg" },
    { dir: "images", ids: POST_IMAGE_IDS, contentType: "image/jpeg" },
    { dir: "videos", ids: POST_VIDEO_IDS, contentType: "video/mp4" },
];

function listAssetFiles(dir) {
    const full = path.join(ASSETS_DIR, dir);
    return fs
        .readdirSync(full)
        .filter((f) => !f.startsWith("."))
        .sort((a, b) => a.localeCompare(b, "en", { numeric: true }))
        .map((f) => path.join(full, f));
}

async function deleteIfExists(bucket, id) {
    try {
        await bucket.delete(new mongoose.Types.ObjectId(id));
    } catch (e) {
        // Fichier inexistant : on ignore (rend le seed idempotent).
    }
}

function uploadOne(bucket, id, filePath, contentType) {
    return new Promise((resolve, reject) => {
        const upload = bucket.openUploadStreamWithId(
            new mongoose.Types.ObjectId(id),
            path.basename(filePath),
            { contentType }
        );
        fs.createReadStream(filePath)
            .on("error", reject)
            .pipe(upload)
            .on("error", reject)
            .on("finish", resolve);
    });
}

async function seedDatabase() {
    try {
        await connectDB();

        if (!IS_TEST_DATASET) {
            console.log("Media : dataset non-test -> aucun média factice inséré.");
            process.exit(0);
        }

        const bucket = getBucket();
        let total = 0;

        for (const group of groups) {
            const files = listAssetFiles(group.dir);
            if (files.length !== group.ids.length) {
                throw new Error(
                    `seed-assets/${group.dir} contient ${files.length} fichier(s) mais ${group.ids.length} id(s) sont attendus. ` +
                    `Synchronise les compteurs de média entre Media/Post/User.`
                );
            }
            for (let i = 0; i < files.length; i++) {
                // delete-then-upload : idempotent même sans RESET_SEED.
                await deleteIfExists(bucket, group.ids[i]);
                await uploadOne(bucket, group.ids[i], files[i], group.contentType);
                total++;
            }
        }

        console.log(`ok : ${total} médias chargés dans GridFS (db-media).`);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
    }
}

seedDatabase();
