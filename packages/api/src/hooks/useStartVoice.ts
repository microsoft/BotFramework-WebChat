import useWebChatAPIContext from './internal/useWebChatAPIContext';

/**
 * Hook to start voice mode (turns on microphone and enables audio synthesis).
 * This starts speech-to-speech interaction.
 */
export default function useStartVoice(): () => void {
  return useWebChatAPIContext().startVoice;
}
