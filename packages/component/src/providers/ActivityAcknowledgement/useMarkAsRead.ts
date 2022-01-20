import useActivityAcknowledgementContext from './private/useContext';

export default function useMarkAsRead(): (activityKey: string) => void {
  return useActivityAcknowledgementContext().markAsRead;
}
