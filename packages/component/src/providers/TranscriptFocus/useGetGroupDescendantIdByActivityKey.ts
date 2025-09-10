import useTranscriptFocusContext from './private/useContext';

export default function useGetGroupDescendantIdByActivityKey(): (activityKey?: string) => string | undefined {
  return useTranscriptFocusContext().getGroupDescendantIdByActivityKey;
}
