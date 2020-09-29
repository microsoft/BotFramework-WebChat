import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useUserID() {
  return [useWebChatAPIContext().userID];
}
