import MessagesView from '@/components/messages/MessagesView'
import { mockConversations } from '@/utils/mockConversations'

export default function MessagesPage() {
  return <MessagesView conversations={mockConversations} />
}
