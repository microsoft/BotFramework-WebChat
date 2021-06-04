import { ActivityComponentFactory } from '../types/ActivityMiddleware';
import useCreateActivityRendererInternal from './internal/useCreateActivityRendererInternal';

// The newer useCreateActivityRenderer() hook does not support override renderAttachment().
// Only the deprecated useRenderActivity() hook support overriding renderAttachment().
export default function useCreateActivityRenderer(): ActivityComponentFactory {
  return useCreateActivityRendererInternal();
}
