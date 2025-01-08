import { useContext } from 'react';
import HTMLContentTransformContext, { type HTMLContentTransformContextType } from './HTMLContentTransformContext';

export default function useHTMLContentTransformContext(): HTMLContentTransformContextType {
  return useContext(HTMLContentTransformContext);
}
