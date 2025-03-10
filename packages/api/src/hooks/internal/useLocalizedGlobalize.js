import useWebChatAPIContext from './useWebChatAPIContext';

export default function useLocalizedGlobalize() {
  return useWebChatAPIContext().localizedGlobalizeState;
}
