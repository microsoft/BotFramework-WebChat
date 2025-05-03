import { type WebChatActivity } from 'botframework-webchat-core';
import React, { memo, useMemo, type ReactNode } from 'react';

import PassthroughFallback from '../private/PassthroughFallback';
import {
  ActivityGroupingDecoratorMiddlewareProxy,
  type ActivityGroupingDecoratorMiddlewareRequest
} from './private/ActivityGroupingDecoratorMiddleware';

type ActivityGroupingDecoratorProxyProps = Readonly<{
  activities: readonly WebChatActivity[];
  children?: ReactNode | undefined;
  groupingName: string;
}>;

function ActivityGroupingDecoratorProxy({ activities, children, groupingName }: ActivityGroupingDecoratorProxyProps) {
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

export default memo(ActivityGroupingDecoratorProxy);
export { type ActivityGroupingDecoratorProxyProps };
