const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
    {
        participants: {
            type: [String],
            required: true,
            validate: {
                validator: (arr) => arr.length === 2,
                message: "A conversation must have exactly 2 participants",
            },
        },
        lastMessage: { type: String, default: null },
        lastMessageAt: { type: Date, default: null },
    },
    { timestamps: true }
);

conversationSchema.index({ participants: 1 });

module.exports = mongoose.model("Conversation", conversationSchema);
