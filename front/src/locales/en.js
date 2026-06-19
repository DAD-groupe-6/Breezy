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
      loading: 'Loading…',
      empty: 'No posts yet. Be the first to publish!',
      loadError: 'Unable to load the feed',
    },
    explorer: {
      title: 'Explore',
      subtitle: 'Search posts by keyword, #tag, or @handle.',
      searchLabel: 'Search content',
      searchPlaceholder: 'Ex: keyword, #tag',
      searchNote: 'This search will be connected to the backend to filter posts by tags and mentions.',
      searching: 'Searching...',
      noResults: 'No results found',
      searchError: 'Error searching',
      suggestionsTitle: 'Suggestions',
    },
    messages: {
      title: 'Messages',
      empty: 'No messages yet.',
      searchPlaceholder: 'Search...',
    },
    notifications: {
      title: 'Notifications',
      empty: 'No notifications yet.',
      actions: {
        likedPhoto: 'liked your photo',
        startedFollowing: 'started following you',
        commentedPhoto: 'commented on your post',
        sharedPost: 'shared your post.',
        mentionedInComment: 'mentioned you in a comment',
      },
    },
    profil: {
      postsSection: 'Posts',
      loading: 'Loading...',
      notFound: 'Profile not found',
      loadMore: 'Load more',
      noPosts: 'No posts yet.',
    },
    settings: {
      title: 'Settings',
      languageSection: 'Language',
      languageDescription: 'Choose the interface language.',
      langFr: 'Français',
      langEn: 'English',
      accountSection: 'Account',
      accountDescription: 'Manage your account',
      logout: 'Log out',
      deleteAccount: 'Delete my account',
      deleteConfirm: 'Do you really want to delete your account? This action is irreversible.',
    },
    newPost: {
      back: 'Back to home',
      publish: 'Publish',
      publishing: 'Publishing...',
      contentLabel: 'Post content',
      contentPlaceholder: "What's new?",
      dropPhoto: 'Drop your photo here',
      dropVideo: 'Drop your video here',
      dropHintPhoto: 'or click the Photo button to select a file',
      dropHintVideo: 'or click the Video button to select a file',
      selectedFile: 'Selected file:',
      photo: 'Photo',
      video: 'Video',
      emoji: 'Emoji',
      location: 'Location',
      networkError: 'Network error, please try again',
    },
  },

  profile: {
    statPosts: 'Posts',
    statFollowing: 'Following',
    statFollowers: 'Followers',
    follow: 'Follow',
    following: 'Following',
    editProfile: 'Edit profile',
    changePhoto: 'Change profile picture',
    optionsAriaLabel: 'Profile options',
    editModal: {
      title: 'Edit profile',
      pseudoLabel: 'Display name',
      bioLabel: 'Bio',
      pseudoInvalid:
        'The name can only contain letters, numbers, spaces, hyphens and underscores.',
      pseudoRequired: 'Name is required.',
      saveError: 'Error while saving',
      cancel: 'Cancel',
      saving: 'Saving...',
      save: 'Save',
    },
  },

  comments: {
    placeholder: 'Add a comment...',
    submit: 'Post',
    empty: 'No comments yet.',
    deleteAria: 'Delete comment',
    likeAria: 'Like comment',
  },

  post: {
    optionsAria: 'More options',
    viewProfile: 'View profile',
    report: 'Report',
    delete: 'Delete',
    deleteError: 'Unable to delete this post. Please try again.',
    deleteConfirm: {
      title: 'Delete post',
      message: 'Do you really want to delete this post? This action is irreversible.',
      confirm: 'Delete',
      cancel: 'Cancel',
      deleting: 'Deleting...',
    },
    imageAlt: 'Post content',
    commentAria: 'Comment',
    likeAria: 'Like',
  },

  avatar: {
    alt: 'Profile picture',
  },

  time: {
    justNow: 'just now',
    minute: 'min',
    hour: 'h',
    day: 'd',
  },

  common: {
    unknownUser: 'Unknown user',
    unknownHandle: 'unknown',
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
      invalid: 'The username can only contain letters, numbers, spaces, hyphens and underscores.',
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
