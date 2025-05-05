import { type RefObject } from 'react';
import { useChatHistoryDOMContext } from './private/ChatHistoryDOMContext';

export default function useActivityElementMapRef(): RefObject<Map<string, HTMLElement>> {
  return useChatHistoryDOMContext().activityElementRef;
}
