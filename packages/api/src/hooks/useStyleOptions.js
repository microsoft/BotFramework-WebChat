import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useStyleOptions() {
  return [useWebChatAPIContext().styleOptions];
}
