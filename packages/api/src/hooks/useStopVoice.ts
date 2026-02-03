import useWebChatAPIContext from './internal/useWebChatAPIContext';

/**
 * Hook to stop voice mode (turns off microphone and stops audio playback).
 * This ends speech-to-speech interaction.
 */
export default function useStopVoice(): () => void {
  return useWebChatAPIContext().stopVoice;
}
