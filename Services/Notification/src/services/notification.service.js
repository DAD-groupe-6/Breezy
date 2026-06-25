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

    // Like/follow/mention : une notif par couple acteur→cible, dédoublonnée via upsert
    // (anti-spam relike/refollow/re-mention) ; isNew=false si déjà présente.
    if (type === "like" || type === "follow" || type === "mention") {
        let filter, onInsert;
        if (type === "like") {
            filter = { ...base, postId };
            onInsert = { read: false, commentId };
        } else if (type === "mention") {
            filter = { ...base, postId, commentId };
            onInsert = { read: false };
        } else { // follow
            filter = base;
            onInsert = { read: false, commentId };
        }
        const res = await Notification.findOneAndUpdate(
            filter,
            { $setOnInsert: onInsert },
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
