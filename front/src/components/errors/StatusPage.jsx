"use client"

import Link from 'next/link'
import { FiAlertTriangle, FiLogIn, FiSearch, FiShield, FiZap } from 'react-icons/fi'
import Badge from '@/components/ui/Badge'
import { useTranslation } from '@/hooks/useTranslation'

const THEME_LABEL_KEYS = {
  light: 'themeLight',
  dark: 'themeDark',
  discord: 'themeDiscord',
  gaming: 'themeGaming',
  neon: 'themeNeon',
  ocean: 'themeOcean',
  minty: 'themeMinty',
  sunset: 'themeSunset',
  forest: 'themeForest',
  berry: 'themeBerry',
  lavender: 'themeLavender',
}

const STATUS_CONFIG = {
  401: {
    icon: FiLogIn,
    iconTone: 'text-[var(--color-text-title)]',
    iconBg: 'bg-[var(--color-text-title)]/10',
    actionType: 'link',
    secondaryHref: '/login',
  },
  403: {
    icon: FiShield,
    iconTone: 'text-[var(--color-status-error)]',
    iconBg: 'bg-[var(--color-status-error)]/10',
    actionType: 'link',
    secondaryHref: '/login',
  },
  404: {
    icon: FiSearch,
    iconTone: 'text-[var(--color-text-title)]',
    iconBg: 'bg-[var(--color-text-title)]/10',
    actionType: 'link',
    secondaryHref: '/',
  },
  429: {
    icon: FiZap,
    iconTone: 'text-[var(--color-text-title)]',
    iconBg: 'bg-[var(--color-text-title)]/10',
    actionType: 'reload',
  },
  500: {
    icon: FiAlertTriangle,
    iconTone: 'text-[var(--color-status-error)]',
    iconBg: 'bg-[var(--color-status-error)]/10',
    actionType: 'reload',
  },
}

function ErrorActions({ actionType, secondaryHref, secondaryLabel }) {
  if (actionType === 'reload') {
    return (
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-5 py-3 text-sm font-semibold text-[var(--color-text-primary)] shadow-[var(--shadow-sm)] transition-transform duration-200 hover:translate-y-[-1px] hover:bg-[var(--color-accent-soft)] hover:shadow-[var(--shadow-md)]"
        >
          <FiZap size={16} />
          {secondaryLabel}
        </button>
      </div>
    )
  }

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <Link
        href={secondaryHref}
        className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-5 py-3 text-sm font-semibold text-[var(--color-text-primary)] shadow-[var(--shadow-sm)] transition-transform duration-200 hover:translate-y-[-1px] hover:bg-[var(--color-accent-soft)] hover:shadow-[var(--shadow-md)]"
      >
        <FiLogIn size={16} />
        {secondaryLabel}
      </Link>
    </div>
  )
}

function InfoItem({ children }) {
  return <li className="text-sm leading-6 text-[var(--color-text-secondary)]">{children}</li>
}

export default function StatusPage({ statusCode }) {
  const { t } = useTranslation()
  const config = STATUS_CONFIG[statusCode] ?? STATUS_CONFIG[403]
  const Icon = config.icon

  return (
    <section className="relative min-h-screen overflow-hidden bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-[var(--color-text-title)]/10 blur-3xl" />
      <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-[var(--color-bg-surface-2)] blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 shadow-[var(--shadow-lg)] sm:p-8 md:p-10">
          <div className="mb-6 flex items-center justify-between gap-4">
            <Badge
              dot
              style={{
                backgroundColor: 'var(--color-accent-soft)',
                color: 'var(--color-text-title)',
              }}
            >
              {statusCode}
            </Badge>
            <span className="text-sm text-[var(--color-text-secondary)]">Breezy</span>
          </div>

          <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <div>
              <div
                className={`mb-5 inline-flex h-16 w-16 items-center justify-center rounded-[28px] ${config.iconBg}`}
              >
                <Icon size={30} strokeWidth={2.4} className={config.iconTone} />
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text-title)] sm:text-4xl md:text-5xl">
                {t(`pages.errors.${statusCode}.title`)}
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-[var(--color-text-secondary)] sm:text-lg">
                {t(`pages.errors.${statusCode}.description`)}
              </p>

              <ErrorActions
                actionType={config.actionType}
                secondaryHref={config.secondaryHref}
                secondaryLabel={t(`pages.errors.${statusCode}.secondaryLabel`)}
              />
            </div>

            <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-surface-2)] p-5 shadow-[var(--shadow-sm)]">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                {t('pages.errors.panelTitle')}
              </p>
              <ul className="mt-4 space-y-4">
                <InfoItem>{t(`pages.errors.${statusCode}.panelLine1`)}</InfoItem>
                <InfoItem>{t(`pages.errors.${statusCode}.panelLine2`)}</InfoItem>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}