import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useStopDictate() {
  return useWebChatAPIContext().stopDictate;
}
