import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useStartDictate(): () => void {
  return useWebChatAPIContext().startDictate;
}
