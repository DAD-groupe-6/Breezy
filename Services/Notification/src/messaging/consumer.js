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

const PERMISSION_BY_TYPE = {
    like: "receive_notifications",
    follow: "receive_notifications",
    comment: "receive_notifications",
};

/**
 * Traite un événement RabbitMQ : vérifie le droit du destinataire, crée la notification
 * et l'émet en temps réel (sauf si elle est dédoublonnée). Auth indisponible = on s'abstient.
 * Entrée : routingKey (string), payload (object) { recipientId, actorId, postId?, commentId? }
 * Sortie : rien
 */
async function handleEvent(routingKey, payload) {
    const type = TYPE_BY_ROUTING_KEY[routingKey];
    if (!type) return;

    const requiredPermission = PERMISSION_BY_TYPE[type];
    if (requiredPermission) {
        let allowed;
        try {
            allowed = await userHasPermission(payload.recipientId, requiredPermission);
        } catch (err) {
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

    if (!isNew) return;

    emitToUser(notification.recipientId, "notification", notification);
    logger.info(`Notif ${type} → user ${notification.recipientId}`);
}

/**
 * Démarre le consumer RabbitMQ branché sur handleEvent.
 * Entrée : rien
 * Sortie : Promise résolue quand le consumer est prêt
 */
function startNotificationConsumer() {
    return startConsumer(handleEvent);
}

module.exports = { startNotificationConsumer };
