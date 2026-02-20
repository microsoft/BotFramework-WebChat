import useWebChatAPIContext from './internal/useWebChatAPIContext';

/**
 * Hook to unmute voice mode (resumes microphone input after muting).
 * This reactivates speech-to-speech listening.
 */
export default function useUnmuteVoice(): () => void {
  return useWebChatAPIContext().unmuteVoice;
}
