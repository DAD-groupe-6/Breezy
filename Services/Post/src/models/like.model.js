const mongoose = require("mongoose");

// Un like = un document à part entière (collection séparée, pas un tableau dans le post).
const likeSchema = new mongoose.Schema(
    {
        post_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            required: true,
        },
        user_id: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Un même utilisateur ne peut liker qu'une fois (remplace $addToSet).
likeSchema.index({ post_id: 1, user_id: 1 }, { unique: true });

module.exports = mongoose.model("Like", likeSchema);
