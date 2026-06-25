const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { requirePermission } = require("../middlewares/permission.middleware");

// Route interne appelée par le service Auth — pas de vérification de permission
router.post("/", UserController.createUser);

// Profil consultable par tout utilisateur authentifié — plus de permission dédiée (view_profile supprimée).
router.get("/search", authenticate({ optional: true }), UserController.searchUsersByPseudo);
router.get("/suggestions", authenticate({ optional: true }), UserController.getSuggestions);
router.get("/:id", authenticate({ optional: true }), UserController.getUser);
router.put("/:id", authenticate({ optional: true }), UserController.updateUser);
router.delete("/:id", authenticate({ optional: true }), requirePermission("moderate_users"), UserController.deleteUser);
router.post("/:id/report", authenticate({ optional: true }), requirePermission("report_content"), UserController.reportUser);
router.post("/:id/ban",    authenticate({ optional: true }), requirePermission("moderate_users"), UserController.banUser);
router.post("/:id/unban",  authenticate({ optional: true }), requirePermission("moderate_users"), UserController.unbanUser);

module.exports = router;
