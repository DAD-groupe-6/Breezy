export const SEARCH_KINDS = ['tag', 'profile', 'content']

export function normalizeSearchKind(kind) {
  return SEARCH_KINDS.includes(kind) ? kind : null
}

export function inferSearchKind(query) {
  if (!query || !query.trim()) return null
  if (query.startsWith('#')) return 'tag'
  if (query.startsWith('@')) return 'profile'
  return 'content'
}

export function normalizeQueryForKind(query, kind) {
  const trimmed = (query || '').trim()
  if (!trimmed) return ''

  if (kind === 'tag') {
    return trimmed.startsWith('#') ? trimmed.slice(1).trim() : trimmed
  }

  if (kind === 'profile') {
    return trimmed.startsWith('@') ? trimmed.slice(1).trim() : trimmed
  }

  return trimmed
}
