import { useSelector } from './internal/WebChatReduxContext';

const selectReferenceGrammarID = ({ referenceGrammarID }) => referenceGrammarID;

export default function useReferenceGrammarID(): [string] {
  return [useSelector(selectReferenceGrammarID)];
}
