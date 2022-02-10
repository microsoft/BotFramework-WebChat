import useTranscriptFocusContext from './private/useContext';

export default function useFocusByActivityKey(): (delta: number) => void {
  return useTranscriptFocusContext().focusRelativeActivity;
}
