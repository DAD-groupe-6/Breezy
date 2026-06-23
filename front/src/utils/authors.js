import api from '@/utils/api'

const cache = {}

export function cacheAuthor(authorId, data) {
  if (authorId == null || !data) return
  cache[authorId] = data
}

export function invalidateAuthor(authorId) {
  delete cache[authorId]
}

export async function resolveAuthor(authorId) {
  if (cache[authorId]) return cache[authorId]
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    
    const { data } = await api.get(`/user/${authorId}`, {
      signal: controller.signal
    })
    clearTimeout(timeout)
    cache[authorId] = data
    return data
  } catch (err) {
    console.error(`[resolveAuthor] Impossible de récupérer l'auteur ${authorId}`, err)
    return null
  }
}
