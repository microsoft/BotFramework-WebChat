import { type ActivityComponentFactory } from '../types/ActivityMiddleware';
import useCreateActivityRendererInternal from './internal/useCreateActivityRendererInternal';
import useWebChatAPIContext from './internal/useWebChatAPIContext';
import { useCreateActivityRendererV2 } from '../providers/ActivityMiddleware/ActivityMiddleware';

// The newer useCreateActivityRenderer() hook does not support override renderAttachment().
// Only the deprecated useRenderActivity() hook support overriding renderAttachment().
export default function useCreateActivityRenderer(): ActivityComponentFactory {
  const useActivityRendererV1 = useCreateActivityRendererInternal();
  const useActivityRendererV2 = useCreateActivityRendererV2();
  const { isUsingActivityMiddlewareV2 } = useWebChatAPIContext();

  if (isUsingActivityMiddlewareV2) {
    return useActivityRendererV2;
  }

  return useActivityRendererV1;
}
