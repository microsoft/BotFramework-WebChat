import { type ReactNode } from 'react';
import useRenderingElementsContext from './private/useRenderingElementsContext';

export default function useRenderingElements(): readonly [readonly ReactNode[]] {
  return useRenderingElementsContext().renderingElementsState;
}
