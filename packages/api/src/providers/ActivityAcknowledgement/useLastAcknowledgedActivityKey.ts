import { type ActivityKey } from '../../types/ActivityKey';
import useActivityAcknowledgementContext from './private/useContext';

export default function useLastAcknowledgedActivityKey(): readonly [ActivityKey] {
  return useActivityAcknowledgementContext().lastAcknowledgedActivityKeyState;
}
