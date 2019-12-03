import useWebChatUIContext from './internal/useWebChatUIContext';

export default function usePostActivity() {
  return useWebChatUIContext().postActivity;
}
