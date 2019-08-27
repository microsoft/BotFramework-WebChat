import useSelector from './useSelector';

export default function useLastTypingAt() {
  return useSelector(({ lastTypingAt }) => lastTypingAt);
}
