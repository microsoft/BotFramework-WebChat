import useTranscriptFocusContext from './private/useContext';

export default function useFocusedKey(): readonly [string] {
  const context = useTranscriptFocusContext();
  return context.focusedGroupKeyState[0] ? context.focusedGroupKeyState : context.focusedActivityKeyState;
}
