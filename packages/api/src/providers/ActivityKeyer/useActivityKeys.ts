import useActivityKeyerContext from './private/useContext';

export default function useActivityKeys(): readonly [readonly string[]] {
  return useActivityKeyerContext().activityKeysState;
}
