import { useSendTypingIndicatorSlice } from './internal/domains/SendBoxSlices';

export default function useSendTypingIndicator(): [boolean] {
  return [useSendTypingIndicatorSlice()];
}
