import { type ActivityKey } from '../../types/ActivityKey';
import useActivityAcknowledgementContext from './private/useContext';

export default function useMarkActivityKeyAsRead(): (activityKey: ActivityKey) => void {
  return useActivityAcknowledgementContext().markActivityKeyAsRead;
}
