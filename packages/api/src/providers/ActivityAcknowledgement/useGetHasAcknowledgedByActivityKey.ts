import { type ActivityKey } from '../../types/ActivityKey';
import useActivityAcknowledgementContext from './private/useContext';

export default function useGetHasAcknoweledgedByActivityKey(): (activityKey: ActivityKey) => boolean | undefined {
  return useActivityAcknowledgementContext().getHasAcknowledgedByActivityKey;
}
