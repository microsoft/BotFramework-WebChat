import useTranscriptFocusContext from './private/useContext';

export default function useGetGroupDescendantIdByGroupKey(): (groupKey?: string) => string | undefined {
  return useTranscriptFocusContext().getGroupDescendantIdByGroupKey;
}
