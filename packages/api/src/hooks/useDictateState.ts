import { useSelector } from './internal/WebChatReduxContext';

// TODO: [P3] We should update this code to use core/src/selectors/dictateState.js
const selectDictateState = ({ dictateState }) => dictateState;

export default function useDictateState(): [number] {
  return [useSelector(selectDictateState)];
}
