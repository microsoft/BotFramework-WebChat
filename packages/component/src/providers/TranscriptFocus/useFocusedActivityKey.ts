import useTranscriptFocusContext from './private/useContext';

export default function useFocusedActivityKey(): readonly [string] {
  return useTranscriptFocusContext().focusedActivityKeyState;
}
