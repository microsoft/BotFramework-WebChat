import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useUserID(): [string] {
  return [useWebChatAPIContext().userID];
}
