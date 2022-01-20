import useTranscriptFocusContext from './private/useContext';

export default function useFocusByActivityKey(): (
  activityKey: boolean | string | undefined,
  withFocus?: boolean
) => void {
  return useTranscriptFocusContext().focusByActivityKey;
}
