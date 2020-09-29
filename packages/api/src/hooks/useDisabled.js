import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useDisabled() {
  return [useWebChatAPIContext().disabled];
}
