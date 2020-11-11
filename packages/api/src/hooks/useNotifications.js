import { useSelector } from './internal/WebChatReduxContext';

export default function useNotifications() {
  return [useSelector(({ notifications }) => notifications)];
}
