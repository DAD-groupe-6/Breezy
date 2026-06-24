const NotificationService = require("../services/notification.service");

function statusFor(message) {
    switch (message) {
        case "Notification not found":
            return 404;
        default:
            return 400;
    }
}

async function list(req, res) {
    try {
        const result = await NotificationService.listForUser(req.user.id);
        res.status(200).json(result);
    } catch (err) {
        res.status(statusFor(err.message)).json({ message: err.message });
    }
}

async function markRead(req, res) {
    try {
        const result = await NotificationService.markRead(req.user.id, req.params.id);
        res.status(200).json(result);
    } catch (err) {
        res.status(statusFor(err.message)).json({ message: err.message });
    }
}

async function markAllRead(req, res) {
    try {
        const result = await NotificationService.markAllRead(req.user.id);
        res.status(200).json(result);
    } catch (err) {
        res.status(statusFor(err.message)).json({ message: err.message });
    }
}

module.exports = { list, markRead, markAllRead };
