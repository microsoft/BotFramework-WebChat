import { useDictateStateSlice } from './internal/domains/SpeechSlices';

// TODO: [P3] We should update this code to use core/src/selectors/dictateState.js
export default function useDictateState(): [number] {
  return [useDictateStateSlice()];
}
