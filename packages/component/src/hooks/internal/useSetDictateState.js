import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useSetDictateState() {
  return useWebChatUIContext().setDictateState;
}
