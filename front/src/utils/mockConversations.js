const mockConversations = [
  {
    id: 1,
    name: 'Amara Diallo',
    preview: 'On se retrouve à 18h ?',
    time: 'maintenant',
    accent: 'bg-[var(--color-text-title)]',
    messages: [
      { id: 1, from: 'them', text: 'Salut ! Tu vas bien ?', time: '10:02' },
      { id: 2, from: 'me', text: 'Oui super, et toi ?', time: '10:04' },
      { id: 3, from: 'them', text: 'Très bien ! Tu as vu mes nouvelles photos ?', time: '10:05' },
      { id: 4, from: 'me', text: 'Oui elles sont magnifiques !\nLe coucher de soleil était incroyable 😍', time: '10:07' },
      { id: 5, from: 'them', text: 'On se retrouve à 18h ?', time: '10:10' },
    ],
  },
  {
    id: 2,
    name: 'Lucas Martin',
    preview: 'Merci pour le partage !',
    time: '5 min',
    accent: 'bg-[var(--color-bg-surface-2)]',
    messages: [{ id: 1, from: 'them', text: 'Merci pour le partage !', time: '09:20' }],
  },
  {
    id: 3,
    name: 'Yuki Tanaka',
    preview: 'Super photo 😍',
    time: '1 h',
    accent: 'bg-[var(--color-text-title)]',
    messages: [{ id: 1, from: 'them', text: 'Super photo 😍', time: '09:40' }],
  },
  {
    id: 4,
    name: 'Omar Benali',
    preview: 'Tu viens ce weekend ?',
    time: 'hier',
    accent: 'bg-[var(--color-bg-surface-2)]',
    messages: [{ id: 1, from: 'them', text: 'Tu viens ce weekend ?', time: '17:12' }],
  },
  {
    id: 5,
    name: 'Sofia Reyes',
    preview: 'Bonne idée !',
    time: 'lun',
    accent: 'bg-[var(--color-bg-surface-2)]',
    messages: [{ id: 1, from: 'them', text: 'Bonne idée !', time: '08:51' }],
  },
]

export { mockConversations }
