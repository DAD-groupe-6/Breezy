import StatusPage from '@/components/errors/StatusPage'

export const metadata = { title: '429 — Breezy' }

export default function TooManyRequestsPage() {
  return <StatusPage statusCode={429} />
}