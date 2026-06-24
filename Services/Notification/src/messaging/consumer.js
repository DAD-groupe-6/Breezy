const { startConsumer } = require("./rabbitmq");
const NotificationService = require("../services/notification.service");
const { emitToUser } = require("../realtime/socket");
const logger = require("../logger");

const TYPE_BY_ROUTING_KEY = {
    "post.liked": "like",
    "post.commented": "comment",
    "user.followed": "follow",
};

async function handleEvent(routingKey, payload) {
    const type = TYPE_BY_ROUTING_KEY[routingKey];
    if (!type) return;

    const { notification, isNew } = await NotificationService.createNotification({
        recipientId: payload.recipientId,
        actorId: payload.actorId,
        type,
        postId: payload.postId || null,
        commentId: payload.commentId || null,
    });

    // Notif dédoublonnée (relike/refollow déjà notifié) → on ne ré-émet pas.
    if (!isNew) return;

    emitToUser(notification.recipientId, "notification", notification);
    logger.info(`Notif ${type} → user ${notification.recipientId}`);
}

function startNotificationConsumer() {
    return startConsumer(handleEvent);
}

module.exports = { startNotificationConsumer };
