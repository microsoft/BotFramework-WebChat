import useActivityTreeContext from './private/useContext';

export default function useOrderedActivityKeys(): readonly [readonly string[]] {
  return useActivityTreeContext().orderedActivityKeys;
}
