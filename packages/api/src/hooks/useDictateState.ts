import { useSelector } from './internal/WebChatReduxContext';

// TODO: [P3] We should update this code to use core/src/selectors/dictateState.js
export default function useDictateState(): [number] {
  return [useSelector(({ dictateState }) => dictateState)];
}
