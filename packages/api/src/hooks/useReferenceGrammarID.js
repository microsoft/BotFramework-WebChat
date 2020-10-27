import { useSelector } from './internal/WebChatReduxContext';

export default function useReferenceGrammarID() {
  return [useSelector(({ referenceGrammarID }) => referenceGrammarID)];
}
