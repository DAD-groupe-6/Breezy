import StatusPage from '@/components/errors/StatusPage'

export const metadata = { title: '401 — Breezy' }

export default function UnauthorizedPage() {
  return <StatusPage statusCode={401} />
}