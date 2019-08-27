import useWebChat from '../useWebChat';

export default function useLanguage() {
  const { language } = useWebChat();

  return language;
}
