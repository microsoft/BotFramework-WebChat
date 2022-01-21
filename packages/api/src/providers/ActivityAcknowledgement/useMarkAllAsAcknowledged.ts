import useActivityAcknowledgementContext from './private/useContext';

export default function useMarkAllAsAcknowledged(): () => void {
  return useActivityAcknowledgementContext().markAllAsAcknowledged;
}
