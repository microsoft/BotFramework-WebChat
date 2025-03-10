import { type Notification } from '../types/Notification';
import { useSelector } from './internal/WebChatReduxContext';

export default function useNotifications(): [Notification[]] {
  return [useSelector(({ notifications }) => notifications)];
}
