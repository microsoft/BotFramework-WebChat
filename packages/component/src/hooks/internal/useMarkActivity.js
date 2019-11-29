import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useMarkActivity() {
  return useWebChatUIContext().markActivity;
}
