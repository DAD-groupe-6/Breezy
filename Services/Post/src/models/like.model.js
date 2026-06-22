const mongoose = require("mongoose");

// Un like = un document à part entière (plus un élément du tableau `likes` du post).
// Ça supprime la limite des 16 Mo par post : un post peut recevoir un nombre
// de likes illimité, chaque like étant stocké séparément.
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

// Index UNIQUE sur le couple (post_id, user_id) : un même utilisateur ne peut
// liker un post qu'une seule fois. C'est ce qui remplace `$addToSet`.
// Une 2e tentative de like lève une erreur Mongo code 11000 (clé dupliquée).
likeSchema.index({ post_id: 1, user_id: 1 }, { unique: true });

module.exports = mongoose.model("Like", likeSchema);
