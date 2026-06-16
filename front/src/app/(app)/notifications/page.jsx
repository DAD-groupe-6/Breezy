const notifications = [
  {
    id: 1,
    name: 'Amara Diallo',
    action: 'a aimé votre photo',
    time: '2 min',
    unread: true,
    avatar: '👩🏾‍🦱',
    tone: 'from-[var(--color-bg-surface-2)] to-[var(--color-bg-surface)]',
  },
  {
    id: 2,
    name: 'Lucas Martin',
    action: 'a commencé à vous suivre',
    time: '15 min',
    unread: true,
    avatar: '🧑🏻‍🦱',
    tone: 'from-[var(--color-bg-surface-2)] to-[var(--color-bg-surface)]',
  },
  {
    id: 3,
    name: 'Yuki Tanaka',
    action: 'a commenté : "Magnifique ! 😍"',
    time: '1 h',
    unread: true,
    avatar: '👩🏻‍💻',
    tone: 'from-[var(--color-bg-surface-2)] to-[var(--color-bg-surface)]',
  },
  {
    id: 4,
    name: 'Omar Benali',
    action: 'a partagé votre publication.',
    time: '3 h',
    unread: true,
    avatar: '🧔🏽',
    tone: 'from-[var(--color-bg-surface-2)] to-[var(--color-bg-surface)]',
  },
  {
    id: 5,
    name: 'Sofia Reyes',
    action: 'a mentionné dans un commentaire',
    time: '5 h',
    unread: false,
    avatar: '👩🏽‍🦰',
    tone: 'from-[var(--color-bg-surface-2)] to-[var(--color-bg-surface)]',
  },
]

function NotificationRow({ name, action, time, unread, avatar, tone }) {
  return (
    <li className="relative border-b border-[var(--color-border)] px-3 py-4 last:border-b-0 sm:px-4 sm:py-3">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${tone} text-lg shadow-sm ring-1 ring-[var(--color-border)] sm:h-10 sm:w-10`}>
          <span aria-hidden="true">{avatar}</span>
        </div>

        <div className="min-w-0 flex-1 pr-5 sm:pr-8">
          <p className="text-[13px] leading-5 text-[var(--color-text-primary)] sm:text-sm">
            <span className="font-semibold text-[var(--color-text-primary)]">{name}</span>{' '}
            <span className="text-[var(--color-text-secondary)]">{action}</span>
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-[var(--color-text-secondary)] sm:text-xs">{time}</p>
        </div>

        {unread && (
          <span className="absolute right-3 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[var(--color-text-title)] shadow-[0_0_0_4px_rgba(67,70,214,0.12)] sm:right-4" />
        )}
      </div>
    </li>
  )
}

export default function NotificationsPage() {
  return (
    <main className="min-h-full bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <div className="mx-auto flex w-full max-w-5xl flex-col px-3 py-3 sm:px-6 sm:py-4 lg:px-8">
        <h1 className="mb-3 text-xl font-bold tracking-tight text-[var(--color-text-title)] sm:mb-4 sm:text-2xl">Notifications</h1>

        <section className="w-full max-w-[480px] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-sm sm:max-w-[500px] lg:max-w-[780px]">
          <ul className="divide-y divide-[var(--color-border)]">
            {notifications.map((notification) => (
              <NotificationRow key={notification.id} {...notification} />
            ))}
          </ul>
        </section>
      </div>
    </main>
  )
}
