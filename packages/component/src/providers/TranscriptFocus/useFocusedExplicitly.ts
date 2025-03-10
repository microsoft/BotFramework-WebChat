import useTranscriptFocusContext from './private/useContext';

export default function useFocusedExplicitly(): readonly [boolean] {
  return useTranscriptFocusContext().focusedExplicitlyState;
}
