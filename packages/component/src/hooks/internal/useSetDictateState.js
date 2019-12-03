import useWebChatUIContext from './useWebChatUIContext';

export default function useSetDictateState() {
  return useWebChatUIContext().setDictateState;
}
