import StatusPage from '@/components/errors/StatusPage'

export const metadata = { title: '500 — Breezy' }

export default function ServerErrorPage() {
  return <StatusPage statusCode={500} />
}