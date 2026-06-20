require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./src/config/database.config");
const Post = require("./src/models/post.model");

const shouldReset = process.env.RESET_SEED === "true";

async function resetData() {
    if (!shouldReset) {
        return;
    }

    console.log("\n--- Reset des donnees Post ---");
    await Post.deleteMany({});
    console.log("✓ Reset Post termine");
}

async function seedDatabase() {
    try {
        console.log("\n=== Debut du seed Post ===\n");

        await connectDB();
        console.log("✓ Connexion MongoDB etablie");

        await resetData();

        console.log("\n--- Creation des posts ---");
        const postFilter = {
            id_user: "user-seed-1",
            type: "post",
            content: "Post exemple minimal",
        };

        await Post.updateOne(
            postFilter,
            {
                $setOnInsert: {
                    image: null,
                    likes: [],
                    nb_signalement: 0,
                    reporters: [],
                    list_tags: ["exemple"],
                    commentsCount: 1,
                    parent_id: null,
                },
            },
            { upsert: true }
        );

        const parentPost = await Post.findOne(postFilter);
        if (!parentPost) {
            throw new Error("Creation du post parent impossible");
        }

        await Post.updateOne(
            {
                id_user: "user-seed-2",
                type: "response",
                parent_id: parentPost._id,
                content: "Commentaire exemple minimal",
            },
            {
                $setOnInsert: {
                    image: null,
                    likes: [],
                    nb_signalement: 0,
                    reporters: [],
                    list_tags: [],
                    commentsCount: 0,
                },
            },
            { upsert: true }
        );

        console.log("  ✓ Post principal et commentaire exemple traites");
        console.log("  // TODO: Ajouter d'autres donnees ici");

        console.log("\n=== Seed Post termine ===\n");
        process.exit(0);
    } catch (error) {
        console.error("\n✗ Erreur lors du seed Post:", error.message);
        console.error(error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
    }
}

seedDatabase();
