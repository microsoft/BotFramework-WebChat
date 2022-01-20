import { ActivityAcknowledgement } from './private/types';
import useActivityAcknowledgementContext from './private/useContext';

export default function useActivityAcknowledgements(): readonly [Readonly<Map<string, ActivityAcknowledgement>>] {
  return useActivityAcknowledgementContext().activityAcknowledgementsState;
}
