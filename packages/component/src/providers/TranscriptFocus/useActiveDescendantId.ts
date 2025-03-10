import useTranscriptFocusContext from './private/useContext';

export default function useActiveDescendantId(): readonly [string] {
  return useTranscriptFocusContext().activeDescendantIdState;
}
