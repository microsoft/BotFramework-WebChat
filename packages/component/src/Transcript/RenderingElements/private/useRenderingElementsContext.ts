import { useContext } from 'react';

import RenderingElementsContext, { type RenderingElementsContextType } from './RenderingElementsContext';

export default function useRenderingElementsContext(): RenderingElementsContextType {
  return useContext(RenderingElementsContext);
}
