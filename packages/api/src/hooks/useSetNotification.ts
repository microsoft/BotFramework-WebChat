import Notification from '../types/Notification';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useSetNotification(): (notification: Notification) => void {
  return useWebChatAPIContext().setNotification;
}
