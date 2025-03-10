import { useSelector } from './internal/WebChatReduxContext';

export default function useReferenceGrammarID(): [string] {
  return [useSelector(({ referenceGrammarID }) => referenceGrammarID)];
}
