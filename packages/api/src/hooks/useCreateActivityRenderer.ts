import { type ActivityComponentFactory } from '../types/ActivityMiddleware';
import useCreateActivityRendererInternal from './internal/useCreateActivityRendererInternal';
import useWebChatAPIContext from './internal/useWebChatAPIContext';
import { useCreateActivityRendererV2 } from '../providers/ActivityMiddleware/ActivityMiddleware';

// The newer useCreateActivityRenderer() hook does not support override renderAttachment().
// Only the deprecated useRenderActivity() hook support overriding renderAttachment().
export default function useCreateActivityRenderer(): ActivityComponentFactory {
  const useCreateActivityRendererV1 = useCreateActivityRendererInternal();
  const { isUsingActivityMiddlewareV2 } = useWebChatAPIContext();

  if (isUsingActivityMiddlewareV2) {
    return useCreateActivityRendererV2;
  }
  return useCreateActivityRendererV1;
}
