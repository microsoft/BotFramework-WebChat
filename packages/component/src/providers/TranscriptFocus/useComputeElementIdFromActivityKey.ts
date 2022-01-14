import useTranscriptFocusContext from './private/useContext';

export default function useComputeElementIdFromActivityKey(): (activityKey?: string) => string | undefined {
  return useTranscriptFocusContext().computeElementIdFromActivityKey;
}
