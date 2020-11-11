import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useGroupActivities() {
  return useWebChatAPIContext().groupActivities;
}
