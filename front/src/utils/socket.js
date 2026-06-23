import { io } from 'socket.io-client'
import { getToken } from '@/utils/cookie'

export function createMessageSocket() {
  return io('/', {
    path: '/api/v1/message/socket.io',
    auth: { token: getToken() },
  })
}
