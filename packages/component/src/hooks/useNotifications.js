import { useSelector } from '../WebChatReduxContext';

export default function useNotifications() {
  return [useSelector(({ notifications }) => notifications)];
}
