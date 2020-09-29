import useWebChatAPIContext from './useWebChatAPIContext';

export default function useTranscriptFocusRef() {
  return [useWebChatAPIContext().transcriptFocusRef];
}
