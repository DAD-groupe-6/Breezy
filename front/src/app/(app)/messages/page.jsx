import { Suspense } from 'react'
import MessagesView from '@/components/messages/MessagesView'

function MessagesContent({ searchParams }) {
  const withUserId = searchParams?.with ?? null
  return <MessagesView initialRecipientId={withUserId} />
}

export default async function MessagesPage({ searchParams }) {
  const params = await searchParams
  return (
    <Suspense>
      <MessagesContent searchParams={params} />
    </Suspense>
  )
}
