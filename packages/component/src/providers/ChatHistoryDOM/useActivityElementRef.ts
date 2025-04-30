import { type RefObject } from 'react';
import useChatHistoryDOMContext from './private/useChatHistoryDOMContext';

export default function useActivityElementMapRef(): RefObject<Map<string, HTMLElement>> {
  return useChatHistoryDOMContext().activityElementRef;
}
