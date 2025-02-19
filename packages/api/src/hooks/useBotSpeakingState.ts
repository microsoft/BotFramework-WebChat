import { useSelector } from './internal/WebChatReduxContext';

export default function useBotSpeakingState(): number {
  return useSelector(({ botSpeakingState }) => botSpeakingState);
}
