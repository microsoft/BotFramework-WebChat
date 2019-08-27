import useWebChat from '../useWebChat';

export default function useLanguage() {
  return useWebChat(({ language }) => language);
}
