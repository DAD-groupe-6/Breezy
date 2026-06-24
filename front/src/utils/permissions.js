// Map rôle -> permissions, miroir du modèle RBAC défini côté backend
// (Services/Auth/seed.js et les middlewares de permission des services).
// Permet de conditionner l'affichage selon les permissions plutôt que le nom du rôle.
const ROLE_PERMISSIONS = {
  visiteur: ['create_account'],
  utilisateur: [
    'authenticate', 'publish_post', 'view_profile_posts', 'view_timeline',
    'like_post', 'reply_post', 'reply_comment', 'follow_user', 'view_profile',
    'list_user_posts', 'add_tags', 'search_tags', 'report_content',
  ],
  moderateur: [
    'authenticate', 'publish_post', 'view_profile_posts', 'view_timeline',
    'like_post', 'reply_post', 'reply_comment', 'follow_user', 'view_profile',
    'list_user_posts', 'list_others_posts', 'add_tags', 'search_tags',
    'report_content', 'moderate_users',
  ],
  administrateur: [
    'create_account', 'authenticate', 'publish_post', 'view_profile_posts',
    'view_timeline', 'like_post', 'reply_post', 'reply_comment', 'follow_user',
    'view_profile', 'list_user_posts', 'list_others_posts', 'add_tags',
    'search_tags', 'report_content', 'moderate_users',
  ],
}

// Indique si le rôle donné possède la permission demandée.
export function hasPermission(roleName, permissionName) {
  const permissions = ROLE_PERMISSIONS[roleName] || []
  return permissions.includes(permissionName)
}
