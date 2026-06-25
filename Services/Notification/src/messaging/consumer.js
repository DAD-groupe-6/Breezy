const { startConsumer } = require("./rabbitmq");
const NotificationService = require("../services/notification.service");
const { userHasPermission } = require("../utils/permission.util");
const { emitToUser } = require("../realtime/socket");
const logger = require("../logger");

const TYPE_BY_ROUTING_KEY = {
    "post.liked": "like",
    "post.commented": "comment",
    "user.followed": "follow",
    "post.mentioned": "mention",
};

// Permission requise (sur le rôle du destinataire) pour recevoir ce type de notification.
// Les notifications de commentaire ne sont gouvernées par aucune permission de la matrice.
const PERMISSION_BY_TYPE = {
    like: "notify_likes",      // Fx15
    follow: "notify_followers", // Fx16
};

async function handleEvent(routingKey, payload) {
    const type = TYPE_BY_ROUTING_KEY[routingKey];
    if (!type) return;

    // Le destinataire a-t-il le droit de recevoir ce type de notification ? (selon son rôle)
    const requiredPermission = PERMISSION_BY_TYPE[type];
    if (requiredPermission) {
        let allowed;
        try {
            allowed = await userHasPermission(payload.recipientId, requiredPermission);
        } catch (err) {
            // Auth indisponible : on s'abstient de notifier (fail-safe) plutôt que de notifier à tort.
            logger.error(`Vérif permission notif échouée (${requiredPermission}) : ${err.message}`);
            return;
        }
        if (!allowed) {
            logger.info(`Notif ${type} ignorée (perm ${requiredPermission} absente) → user ${payload.recipientId}`);
            return;
        }
    }

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
