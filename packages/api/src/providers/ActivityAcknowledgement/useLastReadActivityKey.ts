import useActivityAcknowledgementContext from './private/useContext';

export default function useLastReadActivityKey(): readonly [string | undefined] {
  return useActivityAcknowledgementContext().lastReadActivityKeyState;
}
