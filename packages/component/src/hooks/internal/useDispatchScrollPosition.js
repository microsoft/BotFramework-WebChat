import useWebChatUIContext from './useWebChatUIContext';

export default function useDispatchScrollPosition() {
  const { dispatchScrollPosition, numScrollPositionObservers } = useWebChatUIContext();

  return numScrollPositionObservers ? dispatchScrollPosition : undefined;
}
