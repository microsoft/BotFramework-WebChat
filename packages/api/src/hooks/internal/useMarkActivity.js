import useWebChatAPIContext from './useWebChatAPIContext';

export default function useMarkActivity() {
  return useWebChatAPIContext().markActivity;
}
