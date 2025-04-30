import { type WebChatActivity } from 'botframework-webchat-core';
import React, { memo, useMemo, type ReactNode } from 'react';
import { type ActivityWithRenderer } from '../../../RenderingActivities/ActivityWithRenderer';
import StatusGroupingContext, { type StatusGroupingContextType } from './private/StatusGroupingContext';

type StatusGroupingProps = Readonly<{
  activitiesWithRenderer: readonly ActivityWithRenderer[];
  children?: ReactNode | undefined;
}>;

const StatusGrouping = ({ activitiesWithRenderer, children }: StatusGroupingProps) => {
  if (activitiesWithRenderer.length <= 0) {
    throw new Error('botframework-webchat: "activities" must have at least 1 activity');
  }

  // "activities" props must have at least 1 activity, first/last must not be undefined.
  const firstActivity = activitiesWithRenderer[0].activity as WebChatActivity;
  // eslint-disable-next-line no-magic-numbers
  const lastActivity = activitiesWithRenderer.at(-1).activity as WebChatActivity;

  const context = useMemo<StatusGroupingContextType>(
    () =>
      Object.freeze({
        firstActivityState: Object.freeze<[WebChatActivity]>([firstActivity]),
        lastActivityState: Object.freeze<[WebChatActivity]>([lastActivity])
      }),
    [firstActivity, lastActivity]
  );

  return <StatusGroupingContext.Provider value={context}>{children}</StatusGroupingContext.Provider>;
};

StatusGrouping.displayName = 'StatusGrouping';

export default memo(StatusGrouping);
export { type StatusGroupingProps };
