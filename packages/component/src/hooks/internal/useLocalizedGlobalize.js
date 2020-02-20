import useWebChatUIContext from './useWebChatUIContext';

export default function useLocalizedGlobalize() {
  return useWebChatUIContext().localizedGlobalizeState;
}
