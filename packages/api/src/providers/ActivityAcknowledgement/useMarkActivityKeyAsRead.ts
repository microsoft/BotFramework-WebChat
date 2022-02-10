import useActivityAcknowledgementContext from './private/useContext';

export default function useMarkActivityKeyAsRead(): (activityKey: string) => void {
  return useActivityAcknowledgementContext().markActivityKeyAsRead;
}
