import { useSelector } from '../WebChatReduxContext';

export default function useReferenceGrammarID() {
  return [
    useSelector(({ referenceGrammarID }) => referenceGrammarID),
    () => {
      throw new Error('ReferenceGrammarID cannot be set.');
    }
  ];
}
