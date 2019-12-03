import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useStartDictate() {
  return useWebChatUIContext().startDictate;
}
