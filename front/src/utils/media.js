import api from '@/utils/api'

export function mediaIdFromUrl(url) {
  if (typeof url !== 'string') return null
  const m = url.match(/\/api\/v1\/media\/([a-f0-9]{24})\b/i)
  return m ? m[1] : null
}


export function deleteMedia(urls) {
  const list = (Array.isArray(urls) ? urls : [urls]).filter(Boolean)
  list.forEach((url) => {
    const id = mediaIdFromUrl(url)
    if (!id) return
    api.delete(`/media/${id}`).catch((err) => {
      console.error('[media] Échec de la suppression du média', id, err)
    })
  })
}
