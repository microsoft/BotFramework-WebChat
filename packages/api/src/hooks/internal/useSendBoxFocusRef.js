import useWebChatAPIContext from './useWebChatAPIContext';

export default function useSendBoxFocusRef() {
  return [useWebChatAPIContext().sendBoxFocusRef];
}
