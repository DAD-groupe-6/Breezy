const en = {
  nav: {
    home: 'Home',
    explorer: 'Explore',
    notifications: 'Notifications',
    messages: 'Messages',
    profil: 'Profile',
    settings: 'Settings',
    newPost: 'New post',
    createPost: 'Create a post',
  },

  auth: {
    login: {
      title: 'Sign in',
      subtitle: 'Welcome back to Breezy',
      emailLabel: 'Email',
      emailPlaceholder: 'example@email.com',
      passwordLabel: 'Password',
      passwordPlaceholder: '••••••••',
      submitLoading: 'Signing in...',
      submit: 'Sign in',
      noAccount: "Don't have an account?",
      register: 'Sign up',
    },
    register: {
      title: 'Create an account',
      subtitle: 'Join Breezy today',
      usernameLabel: 'Username',
      usernamePlaceholder: '@yourhandle',
      displayNameLabel: 'Display name',
      displayNamePlaceholder: 'Your full name',
      emailLabel: 'Email',
      emailPlaceholder: 'example@email.com',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Minimum 8 characters',
      confirmLabel: 'Confirm password',
      confirmPlaceholder: '••••••••',
      submitLoading: 'Creating...',
      submit: 'Create my account',
      alreadyAccount: 'Already have an account?',
      login: 'Sign in',
    },
    buttons: {
      login: 'Sign in',
      register: 'Sign up',
      logout: 'Log out',
    },
    currentUser: {
      signIn: 'Sign in',
      signInUsername: 'login',
    },
  },

  pages: {
    home: {
      title: 'Home',
    },
    explorer: {
      title: 'Explore',
      subtitle: 'Search posts by keyword, #tag, or @handle.',
      searchLabel: 'Search content',
      searchPlaceholder: 'e.g. design, #react, @maried',
      searchNote: 'This search will be connected to the backend to filter posts by tags and mentions.',
    },
    messages: {
      title: 'Messages',
      empty: 'No messages yet.',
    },
    notifications: {
      title: 'Notifications',
      empty: 'No notifications yet.',
    },
    profil: {
      postsSection: 'Posts',
    },
    settings: {
      title: 'Settings',
      languageSection: 'Language',
      languageDescription: 'Choose the interface language.',
      langFr: 'Français',
      langEn: 'English',
    },
  },

  profile: {
    statPosts: 'Posts',
    statFollowing: 'Following',
    statFollowers: 'Followers',
    follow: 'Follow',
    editProfile: 'Edit profile',
    changePhoto: 'Change profile picture',
    optionsAriaLabel: 'Profile options',
  },

  comments: {
    placeholder: 'Add a comment...',
    submit: 'Post',
    empty: 'No comments yet.',
  },

  errors: {
    email: {
      required: 'Email is required',
      invalid: 'Invalid email',
    },
    password: {
      required: 'Password is required',
      minLength: 'Minimum 8 characters',
    },
    username: {
      required: 'Username is required',
    },
    confirm: {
      mismatch: 'Passwords do not match',
    },
    network: {
      login: 'Network error, please try again',
      register: 'Network error, please try again',
    },
  },
}

export default en
