import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useStopDictate(): () => void {
  return useWebChatAPIContext().stopDictate;
}
