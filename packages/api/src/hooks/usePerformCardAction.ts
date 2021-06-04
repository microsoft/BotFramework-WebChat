import DirectLineCardAction from '../types/DirectLineCardAction';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function usePerformCardAction(): (
  cardAction: DirectLineCardAction,
  { target }?: { target?: any }
) => void {
  return useWebChatAPIContext().onCardAction;
}
