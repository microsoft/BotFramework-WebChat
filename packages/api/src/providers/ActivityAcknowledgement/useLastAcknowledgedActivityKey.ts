import useActivityAcknowledgementContext from './private/useContext';

export default function useLastAcknowledgedActivityKey(): readonly [string] {
  return useActivityAcknowledgementContext().lastAcknowledgedActivityKeyState;
}
