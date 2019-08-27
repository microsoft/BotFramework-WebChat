import useSelector from './useSelector';

export default function useSendTimeout() {
  return useSelector(({ sendTimeout }) => sendTimeout);
}
