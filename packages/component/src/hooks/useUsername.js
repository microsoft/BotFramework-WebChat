import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useUsername() {
  return [useWebChatUIContext().username];
}
