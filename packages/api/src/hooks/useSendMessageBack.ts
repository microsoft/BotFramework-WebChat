import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useSendMessageBack(): (value: any, text?: string, displayText?: string) => void {
  return useWebChatAPIContext().sendMessageBack;
}
