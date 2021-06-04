import { ScrollToEndButtonCreator } from '../types/ScrollToEndButtonMiddleware';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useCreateScrollToEndButtonRenderer(): ScrollToEndButtonCreator {
  return useWebChatAPIContext().scrollToEndButtonRenderer;
}
