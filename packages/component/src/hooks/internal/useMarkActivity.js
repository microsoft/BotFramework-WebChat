import useWebChatUIContext from './useWebChatUIContext';

export default function useMarkActivity() {
  return useWebChatUIContext().markActivity;
}
