const NotificationService = require("../services/notification.service");

/**
 * Traduit un message d'erreur métier en code HTTP.
 * Entrée : message (string)
 * Sortie : status (number)
 */
function statusFor(message) {
    switch (message) {
        case "Notification not found":
            return 404;
        default:
            return 400;
    }
}

/**
 * Renvoie les notifications de l'utilisateur courant.
 * Entrée : req.user.id (string)
 * Sortie : 200 result { notifications, unreadCount } ; sinon code via statusFor
 */
async function list(req, res) {
    try {
        const result = await NotificationService.listForUser(req.user.id);
        res.status(200).json(result);
    } catch (err) {
        res.status(statusFor(err.message)).json({ message: err.message });
    }
}

/**
 * Marque une notification comme lue.
 * Entrée : req.user.id (string), req.params.id (string)
 * Sortie : 200 result (notification) ; 404 si introuvable
 */
async function markRead(req, res) {
    try {
        const result = await NotificationService.markRead(req.user.id, req.params.id);
        res.status(200).json(result);
    } catch (err) {
        res.status(statusFor(err.message)).json({ message: err.message });
    }
}

/**
 * Marque toutes les notifications de l'utilisateur comme lues.
 * Entrée : req.user.id (string)
 * Sortie : 200 result { message } ; sinon code via statusFor
 */
async function markAllRead(req, res) {
    try {
        const result = await NotificationService.markAllRead(req.user.id);
        res.status(200).json(result);
    } catch (err) {
        res.status(statusFor(err.message)).json({ message: err.message });
    }
}

module.exports = { list, markRead, markAllRead };
