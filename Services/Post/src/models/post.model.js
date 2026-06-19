const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
    {
        id_user: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            trim: true,
            maxlength: 300,
        },
        image: {
            type: String,
            default: null,
        },
        likes: {
            type: [String],
            default: [],
        },
        nb_signalement: {
            type: Number,
            default: 0,
        },
        reporters: {
            type: [String],
            default: [],
        },
        type: {
            type: String,
            enum: ["post", "response"],
            default: "post",
        },
        parent_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            default: null,
        },
        list_tags: {
            type: [String],
            default: [],
        },
        // Compteur dénormalisé : nombre de commentaires (posts "response" enfants).
        // Mis à jour avec $inc à chaque ajout/suppression de commentaire.
        commentsCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Index pour lister rapidement les commentaires d'un post (find par parent_id, tri par date)
postSchema.index({ parent_id: 1, createdAt: -1 });
// Index pour filtrer rapidement le feed sur les vrais posts (type: "post")
postSchema.index({ type: 1, _id: -1 });

module.exports = mongoose.model("Post", postSchema);
