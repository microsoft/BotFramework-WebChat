import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useStartDictate() {
  return useWebChatAPIContext().startDictate;
}
