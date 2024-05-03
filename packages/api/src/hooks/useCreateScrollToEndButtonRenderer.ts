import { type ScrollToEndButtonComponentFactory } from '../types/ScrollToEndButtonMiddleware';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useCreateScrollToEndButtonRenderer(): ScrollToEndButtonComponentFactory {
  return useWebChatAPIContext().scrollToEndButtonRenderer;
}
