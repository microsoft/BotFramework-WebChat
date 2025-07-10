import { type WebChatActivity } from 'botframework-webchat-core';
import React, { memo, useContext, useMemo, type ReactNode } from 'react';

import PassthroughFallback from '../private/PassthroughFallback';
import {
  ActivityGroupingDecoratorMiddlewareProvider,
  ActivityGroupingDecoratorMiddlewareProxy,
  createActivityGroupingMiddleware,
  extractActivityGroupingDecoratorMiddleware,
  type ActivityGroupingDecoratorMiddlewareRequest
} from './private/ActivityGroupingDecoratorMiddleware';
import DecoratorComposerContext from '../private/DecoratorComposerContext';

type ActivityGroupingDecoratorProps = Readonly<{
  activities: readonly WebChatActivity[];
  children?: ReactNode | undefined;
  groupingName: string;
}>;

function ActivityGroupingDecorator({ activities, children, groupingName }: ActivityGroupingDecoratorProps) {
  const request = useMemo<ActivityGroupingDecoratorMiddlewareRequest>(() => ({ groupingName }), [groupingName]);
  const { middleware } = useContext(DecoratorComposerContext);

  const activityGroupingMiddleware = useMemo(
    () => extractActivityGroupingDecoratorMiddleware(middleware),
    [middleware]
  );

  return (
    <ActivityGroupingDecoratorMiddlewareProvider middleware={activityGroupingMiddleware}>
      <ActivityGroupingDecoratorMiddlewareProxy
        activities={activities}
        fallbackComponent={PassthroughFallback}
        request={request}
      >
        {children}
      </ActivityGroupingDecoratorMiddlewareProxy>
    </ActivityGroupingDecoratorMiddlewareProvider>
  );
}

export default memo(ActivityGroupingDecorator);
export { createActivityGroupingMiddleware, type ActivityGroupingDecoratorProps };
