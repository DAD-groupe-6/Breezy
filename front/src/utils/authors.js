import api from '@/utils/api'

const cache = {}

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
  } catch {
    return null
  }
}
