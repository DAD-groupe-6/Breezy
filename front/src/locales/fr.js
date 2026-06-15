const fr = {
  nav: {
    home: 'Accueil',
    explorer: 'Explorer',
    notifications: 'Notifications',
    messages: 'Messages',
    profil: 'Profil',
    settings: 'Paramètres',
    newPost: 'Nouvelle publication',
    createPost: 'Créer un post',
  },

  auth: {
    login: {
      title: 'Connexion',
      subtitle: 'Bon retour sur Breezy',
      emailLabel: 'Email',
      emailPlaceholder: 'exemple@email.com',
      passwordLabel: 'Mot de passe',
      passwordPlaceholder: '••••••••',
      submitLoading: 'Connexion...',
      submit: 'Se connecter',
      noAccount: 'Pas encore de compte ?',
      register: "S'inscrire",
    },
    register: {
      title: 'Créer un compte',
      subtitle: 'Rejoins Breezy dès maintenant',
      usernameLabel: "Nom d'utilisateur",
      usernamePlaceholder: '@tonpseudo',
      displayNameLabel: "Nom d'affichage",
      displayNamePlaceholder: 'Ton nom complet',
      emailLabel: 'Email',
      emailPlaceholder: 'exemple@email.com',
      passwordLabel: 'Mot de passe',
      passwordPlaceholder: 'Minimum 8 caractères',
      confirmLabel: 'Confirmer le mot de passe',
      confirmPlaceholder: '••••••••',
      submitLoading: 'Création...',
      submit: 'Créer mon compte',
      alreadyAccount: 'Déjà un compte ?',
      login: 'Se connecter',
    },
    buttons: {
      login: 'Se connecter',
      register: "S'inscrire",
      logout: 'Déconnexion',
    },
    currentUser: {
      signIn: 'Se connecter',
      signInUsername: 'connexion',
    },
  },

  pages: {
    home: {
      title: 'Accueil',
    },
    explorer: {
      title: 'Explorer',
      subtitle: 'Recherchez des posts par mot-clé, #tag ou @pseudo.',
      searchLabel: 'Rechercher un contenu',
      searchPlaceholder: 'Ex: design, #react, @maried',
      searchNote: 'Cette recherche sera reliée au back plus tard pour filtrer les posts par tags et mentions.',
    },
    messages: {
      title: 'Messages',
      empty: 'Aucun message pour le moment.',
    },
    notifications: {
      title: 'Notifications',
      empty: 'Aucune notification pour le moment.',
    },
    profil: {
      postsSection: 'Posts',
    },
    settings: {
      title: 'Paramètres',
      languageSection: 'Langue',
      languageDescription: "Choisissez la langue de l'interface.",
      langFr: 'Français',
      langEn: 'English',
      accountSection: 'Compte',
      accountDescription: 'Gérez votre compte',
      logout: 'Se déconnecter',
      deleteAccount: 'Supprimer mon compte',
    },
  },

  profile: {
    statPosts: 'Posts',
    statFollowing: 'Suivis',
    statFollowers: 'Followers',
    follow: 'Suivre',
    editProfile: 'Modifier le profil',
    changePhoto: 'Changer la photo de profil',
    optionsAriaLabel: 'Options du profil',
  },

  comments: {
    placeholder: 'Ajouter un commentaire...',
    submit: 'Publier',
    empty: 'Aucun commentaire pour le moment.',
  },

  errors: {
    email: {
      required: "L'email est requis",
      invalid: 'Email invalide',
    },
    password: {
      required: 'Le mot de passe est requis',
      minLength: 'Minimum 8 caractères',
    },
    username: {
      required: "Le nom d'utilisateur est requis",
    },
    confirm: {
      mismatch: 'Les mots de passe ne correspondent pas',
    },
    network: {
      login: 'Erreur réseau, réessaie plus tard',
      register: 'Erreur réseau, réessayez plus tard',
    },
  },
}

export default fr
