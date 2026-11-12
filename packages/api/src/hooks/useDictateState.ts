import { useSelector } from '@msinternal/botframework-webchat-redux-store';

// TODO: [P3] We should update this code to use core/src/selectors/dictateState.js
const selectDictateState = ({ dictateState }) => dictateState;

export default function useDictateState(): [number] {
  return [useSelector(selectDictateState)];
}
