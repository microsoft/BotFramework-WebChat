import { type Notification } from '../types/Notification';
import { useNotificationsSlice } from './internal/domains/ConnectionSlices';

export default function useNotifications(): [Notification[]] {
  return [useNotificationsSlice()];
}
