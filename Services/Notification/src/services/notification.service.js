const Notification = require("../models/notification.model");

// Document Mongo → objet de sortie stable (id en string)
function toView(doc) {
    return {
        id: String(doc._id),
        recipientId: doc.recipientId,
        actorId: doc.actorId,
        type: doc.type,
        postId: doc.postId,
        commentId: doc.commentId,
        read: doc.read,
        createdAt: doc.createdAt,
    };
}

async function createNotification({ recipientId, actorId, type, postId = null, commentId = null }) {
    if (!recipientId || !actorId || !type) {
        throw new Error("Invalid notification payload");
    }

    const base = { recipientId: String(recipientId), actorId: String(actorId), type };

    // Like/follow : une notif par couple acteur→cible. upsert pour dédoublonner
    // (anti-spam relike/refollow) ; isNew=false si déjà présente → pas de ré-émission.
    if (type === "like" || type === "follow") {
        const filter = type === "like" ? { ...base, postId } : base;
        const res = await Notification.findOneAndUpdate(
            filter,
            { $setOnInsert: { read: false, commentId } },
            { new: true, upsert: true, setDefaultsOnInsert: true, includeResultMetadata: true }
        );
        const isNew = !res.lastErrorObject?.updatedExisting;
        return { notification: toView(res.value), isNew };
    }

    // Commentaire : chaque commentaire est distinct → pas de dédoublonnage.
    const doc = await Notification.create({ ...base, postId, commentId });
    return { notification: toView(doc), isNew: true };
}

async function listForUser(userId) {
    const docs = await Notification.find({ recipientId: String(userId) })
        .sort({ createdAt: -1 })
        .limit(50);
    const unreadCount = await Notification.countDocuments({
        recipientId: String(userId),
        read: false,
    });
    return { notifications: docs.map(toView), unreadCount };
}

async function markRead(userId, id) {
    const doc = await Notification.findOneAndUpdate(
        { _id: id, recipientId: String(userId) },
        { read: true },
        { new: true }
    );
    if (!doc) throw new Error("Notification not found");
    return toView(doc);
}

async function markAllRead(userId) {
    await Notification.updateMany(
        { recipientId: String(userId), read: false },
        { read: true }
    );
    return { message: "All notifications marked as read" };
}

module.exports = { createNotification, listForUser, markRead, markAllRead };
