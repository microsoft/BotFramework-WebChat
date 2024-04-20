import useActivityTypingContext from './private/useContext';
import type { Typing } from './types/Typing';

export default function useAllTyping(): readonly [ReadonlyMap<string, Typing>] {
  return useActivityTypingContext().allTypingState;
}
