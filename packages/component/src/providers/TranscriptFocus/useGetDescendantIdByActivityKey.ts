import useTranscriptFocusContext from './private/useContext';

export default function useGetDescendantIdByActivityKey(): (activityKey?: string) => string | undefined {
  return useTranscriptFocusContext().getDescendantIdByActivityKey;
}
