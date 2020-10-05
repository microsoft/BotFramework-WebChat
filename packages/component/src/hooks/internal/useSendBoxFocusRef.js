import useWebChatUIContext from './useWebChatUIContext';

export default function useSendBoxFocusRef() {
  return [useWebChatUIContext().sendBoxFocusRef];
}
