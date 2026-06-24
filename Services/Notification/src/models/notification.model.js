const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        recipientId: { type: String, required: true },
        actorId: { type: String, required: true },
        type: { type: String, enum: ["like", "comment", "follow"], required: true },
        postId: { type: String, default: null },
        commentId: { type: String, default: null },
        read: { type: Boolean, default: false },
    },
    { timestamps: true }
);

notificationSchema.index({ recipientId: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
