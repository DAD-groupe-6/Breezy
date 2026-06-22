const INTERNAL_SERVICE_SECRET = process.env.INTERNAL_SERVICE_SECRET || "internal-secret-key";

const ROLE_PERMISSIONS = {
    visiteur:       ["create_account"],
    utilisateur:    ["authenticate", "publish_post", "view_profile_posts", "view_timeline", "like_post", "reply_post", "reply_comment", "follow_user", "view_profile", "list_user_posts", "add_tags", "search_tags", "report_content"],
    moderateur:     ["authenticate", "publish_post", "view_profile_posts", "view_timeline", "like_post", "reply_post", "reply_comment", "follow_user", "view_profile", "list_user_posts", "add_tags", "search_tags", "report_content", "moderate_users"],
    administrateur: ["create_account", "authenticate", "publish_post", "view_profile_posts", "view_timeline", "like_post", "reply_post", "reply_comment", "follow_user", "view_profile", "list_user_posts", "add_tags", "search_tags", "report_content", "moderate_users"],
};

const requirePermission = (permissionName) => (req, res, next) => {
    if (req.headers["x-internal-secret"] === INTERNAL_SERVICE_SECRET) {
        return next();
    }
    const role = req.user?.role || "visiteur";
    const permissions = ROLE_PERMISSIONS[role] || [];
    if (!permissions.includes(permissionName)) {
        const status = req.user ? 403 : 401;
        return res.status(status).json({ error: "Insufficient permissions" });
    }
    next();
};

module.exports = { requirePermission };
