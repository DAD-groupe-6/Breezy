const express = require("express");
const router = express.Router();
const NotificationController = require("../controllers/notification.controller");
const { authenticate } = require("../middlewares/auth.middleware");

router.get("/", authenticate, NotificationController.list);
router.patch("/read-all", authenticate, NotificationController.markAllRead);
router.patch("/:id/read", authenticate, NotificationController.markRead);

module.exports = router;
