import { type ActivityKey } from '../../types/ActivityKey';
import useActivityAcknowledgementContext from './private/useContext';

/**
 * Returns an arrays of two list of activity keys: read and unread.
 */
export default function useActivityKeysByRead(): readonly [readonly ActivityKey[], readonly ActivityKey[]] {
  return useActivityAcknowledgementContext().activityKeysByReadState;
}
