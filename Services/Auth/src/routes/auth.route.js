const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/auth.controller");
const RoleController = require("../controllers/role.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { requirePermission } = require("../middlewares/permission.middleware");

router.post("/register", authenticate({ optional: true }), AuthController.register);
router.post("/login",    AuthController.login);
router.post("/logout",   AuthController.logout);
router.get("/validate",  authenticate(), AuthController.validate);
router.delete("/account", authenticate(), AuthController.deleteAccount);

router.get("/roles", RoleController.listRoles);
router.get("/roles/:roleId/permissions", RoleController.getRolePermissions);
router.get("/roles/:roleId/permissions/:permissionId", RoleController.checkPermission);
router.get("/roles/:roleId/permissions-by-name/:permissionName", RoleController.checkPermissionByName);
router.get("/users/:userId/permissions-by-name/:permissionName", RoleController.checkPermissionByUserId);

const adminGuard = [authenticate(), requirePermission("manage_roles")];

router.get("/admin/roles", ...adminGuard, RoleController.adminListRoles);
router.post("/admin/roles", ...adminGuard, RoleController.adminCreateRole);
router.put("/admin/roles/:roleId", ...adminGuard, RoleController.adminUpdateRole);
router.delete("/admin/roles/:roleId", ...adminGuard, RoleController.adminDeleteRole);

router.get("/admin/permissions", ...adminGuard, RoleController.adminListPermissions);

module.exports = router;