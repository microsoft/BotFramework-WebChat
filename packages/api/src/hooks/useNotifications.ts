import { type Notification } from '../types/Notification';
import { useSelector } from './internal/WebChatReduxContext';

const selectNotifications = ({ notifications }) => notifications;

export default function useNotifications(): [Notification[]] {
  return [useSelector(selectNotifications)];
}
