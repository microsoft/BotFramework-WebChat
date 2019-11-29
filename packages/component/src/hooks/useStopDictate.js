import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useStopDictate() {
  return useWebChatUIContext().stopDictate;
}
