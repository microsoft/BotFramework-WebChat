import useSelector from './useSelector';

export default function useReferenceGrammarID() {
  return useSelector(({ referenceGrammarID }) => referenceGrammarID);
}
