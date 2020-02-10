import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useLanguage() {
  return [useWebChatUIContext().language];
}
