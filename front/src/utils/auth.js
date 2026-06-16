import { jwtDecode } from 'jwt-decode'
import { getToken } from '@/utils/cookie'

export function getCurrentUserId() {
  const token = getToken()
  return token ? jwtDecode(token).id : null
}
