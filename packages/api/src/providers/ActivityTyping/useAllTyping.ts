import useActivityTypingContext from './private/useContext';
import { type AllTyping } from './types/AllTyping';

export default function useAllTyping(): readonly [ReadonlyMap<string, AllTyping>] {
  return useActivityTypingContext().allTypingState;
}
