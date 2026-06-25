const express = require("express");
const router = express.Router();
const FollowController = require("../controllers/follow.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { requirePermission } = require("../middlewares/permission.middleware");

router.post("/follow/add", authenticate({ optional: true }), requirePermission("follow_user"), FollowController.addFollow);
router.post("/follow/remove", authenticate({ optional: true }), requirePermission("follow_user"), FollowController.removeFollow);
router.get("/:id/followers", authenticate({ optional: true }), FollowController.getFollowers);
router.get("/:id/following", authenticate({ optional: true }), FollowController.getFollowing);

module.exports = router;
