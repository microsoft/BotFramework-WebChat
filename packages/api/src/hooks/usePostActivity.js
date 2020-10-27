import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function usePostActivity() {
  return useWebChatAPIContext().postActivity;
}
