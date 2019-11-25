import { useSelector } from '../WebChatReduxContext';

// TODO: [P3] We should update this code to use core/src/selectors/dictateState.js
export default function useDictateState() {
  return [useSelector(({ dictateState }) => dictateState)];
}
