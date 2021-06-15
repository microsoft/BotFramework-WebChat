import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useSendPostBack(): (value?: any) => void {
  return useWebChatAPIContext().sendPostBack;
}
