import { type MutableRefObject } from 'react';
import useRenderingElementsContext from './private/useRenderingElementsContext';

export default function useActivityElementMapRef(): MutableRefObject<Map<string, HTMLElement>> {
  return useRenderingElementsContext().activityElementMapRef;
}
