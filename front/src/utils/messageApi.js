import api from '@/utils/api'

export const getConversations = () => api.get('/message/conversations')
export const getConversation = (convId) => api.get(`/message/conversations/${convId}`)
export const startConversation = (recipientId) => api.post('/message/conversations', { recipientId })
export const deleteConversation = (convId) => api.delete(`/message/conversations/${convId}`)
export const getMessages = (convId, page = 1) =>
  api.get(`/message/conversations/${convId}/messages?page=${page}&limit=50`)
export const markAsRead = (convId) => api.put(`/message/conversations/${convId}/read`)
