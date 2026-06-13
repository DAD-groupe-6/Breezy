// Formate une date ISO en libellé court "il y a X" (ex: "à l'instant", "5min", "2h", "3j").
export function timeAgo(dateString) {
  const date = new Date(dateString)
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)

  if (seconds < 60) return "à l'instant"

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}min`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}j`

  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}
