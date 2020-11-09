import useWebChatAPIContext from './useWebChatAPIContext';

export default function useLocalizedStrings() {
  const { localizedStrings } = useWebChatAPIContext();

  return localizedStrings;
}
