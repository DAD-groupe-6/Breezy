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
        images: {
            type: [String],
            default: [],
        },
        video: {
            type: String,
            default: null,
        },
        nb_like: {
            type: Number,
            default: 0,
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
        reply_to: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            default: null,
        },
        list_tags: {
            type: [String],
            default: [],
        },

        commentsCount: {
            type: Number,
            default: 0,
        },

        edited: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

postSchema.index({ parent_id: 1, createdAt: -1 });

postSchema.index({ type: 1, _id: -1 });

module.exports = mongoose.model("Post", postSchema);
