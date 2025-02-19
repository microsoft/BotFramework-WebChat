import useWebChatAPIContext from './useWebChatAPIContext';

export default function useSetBotSpeakingState(): (botSpeaking: number) => void {
  return useWebChatAPIContext().setBotSpeakingState;
}
