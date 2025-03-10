import useTranscriptFocusContext from './private/useContext';

export default function useFocusRelativeActivity(): (delta: number) => void {
  return useTranscriptFocusContext().focusRelativeActivity;
}
