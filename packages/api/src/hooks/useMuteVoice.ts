import useWebChatAPIContext from './internal/useWebChatAPIContext';

/**
 * Hook to mute voice mode (stops microphone input but keeps connection alive with silent chunks).
 * The session remains active and can be unmuted to resume listening.
 */
export default function useMuteVoice(): () => void {
  return useWebChatAPIContext().muteVoice;
}
