import useWebChatUIContext from './useWebChatUIContext';

export default function useDispatchTranscriptFocusByActivityKey(): (activityKey: string | undefined) => void {
  return useWebChatUIContext().dispatchTranscriptFocusByActivityKey;
}
