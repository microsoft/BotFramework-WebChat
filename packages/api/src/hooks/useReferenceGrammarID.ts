import { useSelector } from '@msinternal/botframework-webchat-redux-store';

const selectReferenceGrammarID = ({ referenceGrammarID }) => referenceGrammarID;

export default function useReferenceGrammarID(): [string] {
  return [useSelector(selectReferenceGrammarID)];
}
