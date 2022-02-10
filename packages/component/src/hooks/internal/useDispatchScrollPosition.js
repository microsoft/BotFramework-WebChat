import useWebChatUIContext from './useWebChatUIContext';

export default function useDispatchScrollPosition() {
  return useWebChatUIContext().dispatchScrollPosition;
}
