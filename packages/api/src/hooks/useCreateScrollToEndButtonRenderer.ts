import { ScrollToEndButtonCreator } from '../types/scrollToEndButtonMiddleware';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useCreateScrollToEndButtonRenderer(): ScrollToEndButtonCreator {
  return useWebChatAPIContext().scrollToEndButtonRenderer;
}
