import useSelector from './useSelector';

export default function useSendTypingIndicator() {
  return useSelector(({ sendTypingIndicator }) => sendTypingIndicator);
}
