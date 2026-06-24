import StatusPage from '@/components/errors/StatusPage'

export const metadata = { title: '404 — Breezy' }

export default function NotFound() {
  return <StatusPage statusCode={404} />
}