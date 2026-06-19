'use client'

import { useTranslation } from '@/hooks/useTranslation'
import NotificationItem from '@/components/notifications/NotificationItem'

export default function NotificationsView({ notifications }) {
  const { t, locale } = useTranslation()

  return (
    <main className="min-h-full bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <div className="mx-auto w-full max-w-3xl px-[var(--space-md)] py-4 md:px-[var(--space-lg)]">
        <section className="w-full overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-sm">
          {notifications.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-[var(--color-text-secondary)]">
              {t('pages.notifications.empty')}
            </p>
          ) : (
            <ul className="divide-y divide-[var(--color-border)]">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  t={t}
                  locale={locale}
                />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}
