import { PerformCardAction } from '../types/CardActionMiddleware';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function usePerformCardAction(): PerformCardAction {
  return useWebChatAPIContext().onCardAction;
}
