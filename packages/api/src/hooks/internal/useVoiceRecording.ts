import { useSelector } from './WebChatReduxContext';

/**
 * Hook to get the voice recording state.
 */
export default function useVoiceRecording(): [boolean] {
  return [useSelector(({ voice }) => voice.recording)];
}
