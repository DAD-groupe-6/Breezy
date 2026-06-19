// Formate une date ISO en libellé court "il y a X" (ex: "à l'instant", "5min", "2h", "3j").
// Les libellés viennent de l'i18n : `t` est la fonction de traduction et `locale`
// la langue courante (utilisée pour le format de date long).
export function timeAgo(dateString, t, locale = 'fr') {
  const date = new Date(dateString)
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)

  if (seconds < 60) return t('time.justNow')

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}${t('time.minute')}`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}${t('time.hour')}`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}${t('time.day')}`

  return date.toLocaleDateString(locale === 'en' ? 'en-US' : 'fr-FR', { day: 'numeric', month: 'short' })
}
