import { useSelector } from './internal/WebChatReduxContext';
import type Notification from '../types/Notification';

export default function useNotifications(): [Notification[]] {
  return [useSelector(({ notifications }) => notifications)];
}
