import api from '@/utils/api'

const cache = {}

export async function resolveAuthor(authorId) {
  if (cache[authorId]) return cache[authorId]
  try {
    const { data } = await api.get(`/user/${authorId}`)
    cache[authorId] = data
    return data
  } catch {
    return null
  }
}
