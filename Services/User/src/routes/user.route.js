const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { requirePermission } = require("../middlewares/permission.middleware");

// Route interne appelée par le service Auth — pas de vérification de permission
router.post("/", UserController.createUser);

router.get("/search", authenticate({ optional: true }), requirePermission("view_profile"), UserController.searchUsersByPseudo);
router.get("/suggestions", authenticate({ optional: true }), requirePermission("view_profile"), UserController.getSuggestions);
router.get("/:id", authenticate({ optional: true }), requirePermission("view_profile"), UserController.getUser);
router.put("/:id", authenticate({ optional: true }), requirePermission("view_profile"), UserController.updateUser);
router.delete("/:id", authenticate({ optional: true }), requirePermission("moderate_users"), UserController.deleteUser);
router.post("/:id/report", authenticate({ optional: true }), requirePermission("report_content"), UserController.reportUser);
router.post("/:id/ban",    authenticate({ optional: true }), requirePermission("moderate_users"), UserController.banUser);
router.post("/:id/unban",  authenticate({ optional: true }), requirePermission("moderate_users"), UserController.unbanUser);

module.exports = router;
