import useWebChatUIContext from './useWebChatUIContext';

export default function useLocalizedStrings() {
  const { localizedStrings } = useWebChatUIContext();

  return localizedStrings;
}
