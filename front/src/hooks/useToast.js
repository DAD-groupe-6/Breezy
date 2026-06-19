import { useToastContext } from '@/providers/ToastProvider'

export function useToast() {
  const { addToast } = useToastContext()
  return {
    success: (message, duration) => addToast('success', message, duration),
    error: (message, duration) => addToast('error', message, duration),
    info: (message, duration) => addToast('info', message, duration),
  }
}
