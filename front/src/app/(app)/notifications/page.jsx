import NotificationsView from '@/components/notifications/NotificationsView'
import { mockNotifications } from '@/utils/mockNotifications'

export default function NotificationsPage() {
  return <NotificationsView notifications={mockNotifications} />
}
