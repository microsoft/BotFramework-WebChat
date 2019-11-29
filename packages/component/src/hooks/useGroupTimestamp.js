import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useGroupTimestamp() {
  return [useWebChatUIContext().groupTimestamp];
}
