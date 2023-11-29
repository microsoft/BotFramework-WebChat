import { type ActivityKey } from '../../types/ActivityKey';
import useActivityAcknowledgementContext from './private/useContext';

export default function useLastReadActivityKey(): readonly [ActivityKey] {
  return useActivityAcknowledgementContext().lastReadActivityKeyState;
}
