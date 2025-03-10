import useActivityAcknowledgementContext from './private/useContext';

export default function useGetHasAcknoweledgedByActivityKey(): (activityKey: string) => boolean | undefined {
  return useActivityAcknowledgementContext().getHasAcknowledgedByActivityKey;
}
