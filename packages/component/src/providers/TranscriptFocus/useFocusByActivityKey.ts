import useTranscriptFocusContext from './private/useContext';

export default function useFocusByActivityKey(): (
  activityKey: false | string | undefined,
  withFocus?: boolean
) => void {
  return useTranscriptFocusContext().focusByActivityKey;
}
