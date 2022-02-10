import useActivityAcknowledgementContext from './private/useContext';

/**
 * Returns an arrays of two list of activity keys: read and unread.
 */
export default function useActivityKeysByRead(): readonly [readonly string[], readonly string[]] {
  return useActivityAcknowledgementContext().activityKeysByReadState;
}
