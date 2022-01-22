import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useSendMessage(): (
  text: string,
  method?: string,
  { channelData }?: { channelData?: any }
) => void {
  return useWebChatAPIContext().sendMessage;
}
