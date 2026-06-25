const Notification = require("../models/notification.model");

/**
 * Transforme un document Mongo en objet de sortie stable (id en string).
 * Entrée : doc (object Mongoose)
 * Sortie : view (object) { id, recipientId, actorId, type, postId, commentId, read, createdAt }
 */
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

/**
 * Crée une notification ; like/follow/mention sont dédoublonnés par upsert (anti-spam),
 * un commentaire crée toujours une nouvelle entrée.
 * Entrée : payload (object) { recipientId, actorId, type, postId?, commentId? }
 * Sortie : result (object) { notification (view), isNew (boolean) } ; throw si payload invalide
 */
async function createNotification({ recipientId, actorId, type, postId = null, commentId = null }) {
    if (!recipientId || !actorId || !type) {
        throw new Error("Invalid notification payload");
    }

    const base = { recipientId: String(recipientId), actorId: String(actorId), type };

    if (type === "like" || type === "follow" || type === "mention") {
        let filter, onInsert;
        if (type === "like") {
            filter = { ...base, postId };
            onInsert = { read: false, commentId };
        } else if (type === "mention") {
            filter = { ...base, postId, commentId };
            onInsert = { read: false };
        } else {
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

    const doc = await Notification.create({ ...base, postId, commentId });
    return { notification: toView(doc), isNew: true };
}

/**
 * Renvoie les 50 dernières notifications d'un utilisateur et le nombre de non-lues.
 * Entrée : userId (string)
 * Sortie : result (object) { notifications (array de view), unreadCount (number) }
 */
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

/**
 * Marque une notification de l'utilisateur comme lue.
 * Entrée : userId (string), id (string)
 * Sortie : view (object notification) ; throw "Notification not found"
 */
async function markRead(userId, id) {
    const doc = await Notification.findOneAndUpdate(
        { _id: id, recipientId: String(userId) },
        { read: true },
        { new: true }
    );
    if (!doc) throw new Error("Notification not found");
    return toView(doc);
}

/**
 * Marque toutes les notifications non-lues d'un utilisateur comme lues.
 * Entrée : userId (string)
 * Sortie : result (object) { message }
 */
async function markAllRead(userId) {
    await Notification.updateMany(
        { recipientId: String(userId), read: false },
        { read: true }
    );
    return { message: "All notifications marked as read" };
}

module.exports = { createNotification, listForUser, markRead, markAllRead };
