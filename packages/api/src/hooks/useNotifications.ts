import { type Notification } from '../types/Notification';
import { useNotificationsContext } from './internal/domains/NotificationsContext';
import useSourceValue from './internal/domains/useSourceValue';

export default function useNotifications(): [Notification[]] {
  return [useSourceValue(useNotificationsContext().notifications)];
}
