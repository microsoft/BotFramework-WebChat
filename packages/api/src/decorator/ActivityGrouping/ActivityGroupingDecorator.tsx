import { type WebChatActivity } from 'botframework-webchat-core';
import React, { memo, useMemo, type ReactNode } from 'react';

import PassthroughFallback from '../private/PassthroughFallback';
import {
  ActivityGroupingDecoratorMiddlewareProxy,
  createActivityGroupingMiddleware,
  type ActivityGroupingDecoratorMiddlewareRequest
} from './private/ActivityGroupingDecoratorMiddleware';

type ActivityGroupingDecoratorProps = Readonly<{
  activities: readonly WebChatActivity[];
  children?: ReactNode | undefined;
  groupingName: string;
}>;

function ActivityGroupingDecorator({ activities, children, groupingName }: ActivityGroupingDecoratorProps) {
  const request = useMemo<ActivityGroupingDecoratorMiddlewareRequest>(() => ({ groupingName }), [groupingName]);

  return (
    <ActivityGroupingDecoratorMiddlewareProxy
      activities={activities}
      fallbackComponent={PassthroughFallback}
      request={request}
    >
      {children}
    </ActivityGroupingDecoratorMiddlewareProxy>
  );
}

export default memo(ActivityGroupingDecorator);
export { createActivityGroupingMiddleware, type ActivityGroupingDecoratorProps };
