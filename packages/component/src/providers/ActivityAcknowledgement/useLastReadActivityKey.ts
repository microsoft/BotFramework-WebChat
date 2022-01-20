import useActivityAcknowledgementContext from './private/useContext';

export default function useLastReadActivityKey(): readonly [string] {
  return useActivityAcknowledgementContext().lastReadActivityKeyState;
}
