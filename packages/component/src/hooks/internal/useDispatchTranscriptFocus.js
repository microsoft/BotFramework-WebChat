import useWebChatUIContext from './useWebChatUIContext';

export default function useDispatchTranscriptFocus() {
  const { dispatchTranscriptFocus, numTranscriptFocusObservers } = useWebChatUIContext();

  return numTranscriptFocusObservers ? dispatchTranscriptFocus : undefined;
}
