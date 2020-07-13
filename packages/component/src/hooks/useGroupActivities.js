import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useGroupActivities() {
  return useWebChatUIContext().groupActivities;
}
