import useLocalizedStrings from './internal/useLocalizedStrings';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useLanguage(options?: 'speech'): [string] {
  const { language } = useWebChatAPIContext();
  const localizedStrings = useLocalizedStrings();

  if (options === 'speech') {
    return [localizedStrings.SPEECH_LANGUAGE || language];
  }

  return [language];
}
