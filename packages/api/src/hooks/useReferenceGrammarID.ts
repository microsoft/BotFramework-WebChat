import { useReferenceGrammarIDSlice } from './internal/domains/ConnectionSlices';

export default function useReferenceGrammarID(): [string] {
  return [useReferenceGrammarIDSlice()];
}
