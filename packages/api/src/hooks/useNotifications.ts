import { useSelector } from './internal/WebChatReduxContext';
import Notification from '../types/Notification';

export default function useNotifications(): [Notification[]] {
  return [useSelector(({ notifications }) => notifications)];
}
