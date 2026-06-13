const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
    {
        authorId: {
            type: Number,
            required: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 300,
        },
        likes: {
            type: [Number],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Post", postSchema);
