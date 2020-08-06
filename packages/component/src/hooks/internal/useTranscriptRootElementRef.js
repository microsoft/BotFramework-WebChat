import useWebChatUIContext from './useWebChatUIContext';

export default function useTranscriptRootElementRef() {
  return [useWebChatUIContext().transcriptRootElementRef];
}
