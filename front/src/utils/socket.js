import { io } from 'socket.io-client'
import { getToken } from '@/utils/cookie'

export function createMessageSocket() {
  return io('/', {
    path: '/api/v1/message/socket.io',
    auth: { token: getToken() },
  })
}

let socket = null
let socketToken = null

// Connexion unique, vers la même origine (la gateway), avec le JWT dans le handshake.
// Si le token change (changement de compte dans le même navigateur), on recrée le
// socket pour rejoindre la bonne room — sinon on resterait dans celle de l'ancien user.
export function getSocket() {
  const token = getToken()
  if (!token) return null
  if (socket && socketToken === token) return socket
  if (socket) socket.disconnect()
  socketToken = token
  socket = io({ auth: { token } })
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
    socketToken = null
  }
}
