import StatusPage from '@/components/errors/StatusPage'

export const metadata = { title: '403 — Breezy' }

export default function ForbiddenPage() {
  return <StatusPage statusCode={403} />
}