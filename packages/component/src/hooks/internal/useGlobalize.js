import useWebChatUIContext from './useWebChatUIContext';

export default function useGlobalize() {
  return useWebChatUIContext().globalize;
}
