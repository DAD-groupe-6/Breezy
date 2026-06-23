const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user.controller");
const { optionalAuthenticate } = require("../middlewares/auth.middleware");
const { requirePermission } = require("../middlewares/permission.middleware");

// Route interne appelée par le service Auth — pas de vérification de permission
router.post("/", UserController.createUser);

router.get("/search", optionalAuthenticate, requirePermission("view_profile"), UserController.searchUsersByPseudo);
router.get("/suggestions", optionalAuthenticate, requirePermission("view_profile"), UserController.getSuggestions);
router.get("/:id", optionalAuthenticate, requirePermission("view_profile"), UserController.getUser);
router.put("/:id", optionalAuthenticate, requirePermission("view_profile"), UserController.updateUser);
router.delete("/:id", optionalAuthenticate, requirePermission("moderate_users"), UserController.deleteUser);
router.post("/:id/report", optionalAuthenticate, requirePermission("report_content"), UserController.reportUser);
router.post("/:id/ban",    optionalAuthenticate, requirePermission("moderate_users"), UserController.banUser);
router.post("/:id/unban",  optionalAuthenticate, requirePermission("moderate_users"), UserController.unbanUser);

module.exports = router;
