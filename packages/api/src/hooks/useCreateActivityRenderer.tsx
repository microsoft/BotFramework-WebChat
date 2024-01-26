import * as React from 'react';
import { type ActivityComponentFactory } from '../types/ActivityMiddleware';
import useCreateActivityRendererInternal from './internal/useCreateActivityRendererInternal';
import useWebChatAPIContext from './internal/useWebChatAPIContext';
import { ActivityMiddlewareProxy } from '../providers/ActivityMiddleware/ActivityMiddleware';

// The newer useCreateActivityRenderer() hook does not support override renderAttachment().
// Only the deprecated useRenderActivity() hook support overriding renderAttachment().
export default function useCreateActivityRenderer(): ActivityComponentFactory {
  const useCreateActivityRendererV1 = useCreateActivityRendererInternal();
  const { isUsingActivityMiddlewareV2 } = useWebChatAPIContext();

  if (isUsingActivityMiddlewareV2) {
    return options =>
      function ActivityRendererV2(props) {
        return <ActivityMiddlewareProxy request={options} {...props} {...options} />;
      };
  }

  return useCreateActivityRendererV1;
}
