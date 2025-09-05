import useTranscriptFocusContext from './private/useContext';

export default function useActiveDescendantId(): readonly [string] {
  const context = useTranscriptFocusContext();
  return context.activeGroupDescendantIdState[0]
    ? context.activeGroupDescendantIdState
    : context.activeDescendantIdState;
}
