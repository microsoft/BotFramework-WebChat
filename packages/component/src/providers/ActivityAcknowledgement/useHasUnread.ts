import useActivityAcknowledgementContext from './private/useContext';

export default function useHasUnread(): readonly [boolean] {
  return useActivityAcknowledgementContext().hasUnreadState;
}
