const express = require("express");
const router = express.Router();
const NotificationController = require("../controllers/notification.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { requirePermission } = require("../middlewares/permission.middleware");

router.get("/", authenticate, requirePermission("receive_notifications"), NotificationController.list);
router.patch("/read-all", authenticate, requirePermission("receive_notifications"), NotificationController.markAllRead);
router.patch("/:id/read", authenticate, requirePermission("receive_notifications"), NotificationController.markRead);

module.exports = router;
