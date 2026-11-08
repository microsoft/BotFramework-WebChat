import { useSpeechContext } from './internal/domains/SpeechContext';
import useSourceValue from './internal/domains/useSourceValue';

// TODO: [P3] We should update this code to use core/src/selectors/dictateState.js
export default function useDictateState(): [number] {
  return [useSourceValue(useSpeechContext().dictateState)];
}
