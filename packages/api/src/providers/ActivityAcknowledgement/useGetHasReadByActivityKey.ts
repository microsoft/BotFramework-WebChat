import useActivityAcknowledgementContext from './private/useContext';

export default function useGetHasReadByActivityKey(): (activityKey: string) => boolean | undefined {
  return useActivityAcknowledgementContext().getHasReadByActivityKey;
}
