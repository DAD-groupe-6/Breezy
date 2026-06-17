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
      loading: 'Chargement…',
      empty: 'Aucun post pour le moment. Soyez le premier à publier !',
      loadError: 'Impossible de charger le feed',
    },
    explorer: {
      title: 'Explorer',
      subtitle: 'Recherchez des posts par mot-clé, #tag ou @pseudo.',
      searchLabel: 'Rechercher un contenu',
      searchPlaceholder: 'Ex: mot-clé, #tag',
      searchNote: 'Cette recherche sera reliée au back plus tard pour filtrer les posts par tags et mentions.',
    },
    messages: {
      title: 'Messages',
      empty: 'Aucun message pour le moment.',
      searchPlaceholder: 'Rechercher...',
    },
    notifications: {
      title: 'Notifications',
      empty: 'Aucune notification pour le moment.',
    },
    profil: {
      postsSection: 'Posts',
      loading: 'Chargement...',
      notFound: 'Profil introuvable',
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
      deleteConfirm: 'Voulez-vous vraiment supprimer votre compte ? Cette action est irréversible.',
    },
    newPost: {
      back: "Retour à l'accueil",
      publish: 'Publier',
      publishing: 'Publication...',
      contentLabel: 'Contenu de la publication',
      contentPlaceholder: 'Quoi de neuf ?',
      dropPhoto: 'Deposez votre photo ici',
      dropVideo: 'Deposez votre video ici',
      dropHintPhoto: 'ou cliquez sur le bouton Photo pour selectionner un fichier',
      dropHintVideo: 'ou cliquez sur le bouton Video pour selectionner un fichier',
      selectedFile: 'Fichier selectionne:',
      photo: 'Photo',
      video: 'Video',
      emoji: 'Emoji',
      location: 'Lieu',
      networkError: 'Erreur réseau, réessaie plus tard',
    },
  },

  profile: {
    statPosts: 'Posts',
    statFollowing: 'Suivis',
    statFollowers: 'Followers',
    follow: 'Suivre',
    following: 'Abonné',
    editProfile: 'Modifier le profil',
    changePhoto: 'Changer la photo de profil',
    optionsAriaLabel: 'Options du profil',
  },

  comments: {
    placeholder: 'Ajouter un commentaire...',
    submit: 'Publier',
    empty: 'Aucun commentaire pour le moment.',
    deleteAria: 'Supprimer le commentaire',
    likeAria: 'Aimer le commentaire',
  },

  post: {
    optionsAria: "Plus d'options",
    viewProfile: 'Voir le profil',
    report: 'Signaler',
    delete: 'Supprimer',
    deleteError: 'Impossible de supprimer ce post. Réessaie.',
    imageAlt: 'Contenu du post',
    commentAria: 'Commenter',
    likeAria: 'Aimer',
  },

  avatar: {
    alt: 'Photo de profil',
  },

  time: {
    justNow: "à l'instant",
    minute: 'min',
    hour: 'h',
    day: 'j',
  },

  common: {
    unknownUser: 'Utilisateur inconnu',
    unknownHandle: 'inconnu',
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
