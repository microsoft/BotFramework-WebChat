import { useSendBoxValueSlice } from './internal/domains/SendBoxSlices';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useSendBoxValue(): [string, (value: string) => void] {
  return [useSendBoxValueSlice(), useWebChatAPIContext().setSendBox];
}
