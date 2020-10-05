import useWebChatUIContext from './useWebChatUIContext';

export default function useTranscriptFocusRef() {
  return [useWebChatUIContext().transcriptFocusRef];
}
