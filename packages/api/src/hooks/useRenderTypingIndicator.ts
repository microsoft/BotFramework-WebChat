import { RenderTypingIndicator } from '../types/TypingIndicatorMiddleware';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useRenderTypingIndicator(): RenderTypingIndicator {
  return useWebChatAPIContext().typingIndicatorRenderer;
}
