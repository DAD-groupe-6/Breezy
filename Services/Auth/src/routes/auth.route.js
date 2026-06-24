const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/auth.controller");
const RoleController = require("../controllers/role.controller");
const { authenticate } = require("../middlewares/auth.middleware");

router.post("/register", authenticate({ optional: true }), AuthController.register);
router.post("/login",    AuthController.login);
router.post("/logout",   AuthController.logout);
router.get("/validate",  authenticate(), AuthController.validate);
router.delete("/account", authenticate(), AuthController.deleteAccount);

router.get("/roles", RoleController.listRoles);
router.get("/roles/:roleId/permissions/:permissionId", RoleController.checkPermission);
router.get("/roles/:roleId/permissions-by-name/:permissionName", RoleController.checkPermissionByName);

module.exports = router;