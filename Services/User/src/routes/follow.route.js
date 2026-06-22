const express = require("express");
const router = express.Router();
const FollowController = require("../controllers/follow.controller");
const { optionalAuthenticate } = require("../middlewares/auth.middleware");
const { requirePermission } = require("../middlewares/permission.middleware");

router.post("/follow/add", optionalAuthenticate, requirePermission("follow_user"), FollowController.addFollow);
router.post("/follow/remove", optionalAuthenticate, requirePermission("follow_user"), FollowController.removeFollow);
router.get("/:id/followers", optionalAuthenticate, requirePermission("view_profile"), FollowController.getFollowers);
router.get("/:id/following", optionalAuthenticate, requirePermission("view_profile"), FollowController.getFollowing);

module.exports = router;
