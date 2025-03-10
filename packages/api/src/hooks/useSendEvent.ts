import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useSendEvent(): (name: string, value: any) => void {
  return useWebChatAPIContext().sendEvent;
}
