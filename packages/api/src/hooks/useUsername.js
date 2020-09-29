import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useUsername() {
  return [useWebChatAPIContext().username];
}
