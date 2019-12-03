import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useDisabled() {
  return [useWebChatUIContext().disabled];
}
