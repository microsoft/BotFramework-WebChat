import useWebChatUIContext from './useWebChatUIContext';

export default function useTranscriptActivityElementsRef() {
  return [useWebChatUIContext().transcriptActivityElementsRef];
}
