import useContext from './private/useContext';

export default function useRenderingActivityKeys(): readonly [readonly string[]] {
  return useContext().renderingActivityKeysState;
}
