import { type WebChatActivity } from 'botframework-webchat-core';
import React, { memo, useMemo, type ReactNode } from 'react';
import StatusGroupingContext, { type StatusGroupingContextType } from './private/StatusGroupingContext';

type StatusGroupingProps = Readonly<{
  activities: readonly WebChatActivity[];
  children?: ReactNode | undefined;
}>;

const StatusGrouping = ({ activities, children }: StatusGroupingProps) => {
  if (activities.length <= 0) {
    throw new Error('botframework-webchat: "activities" must have at least 1 activity');
  }

  // "activities" props must have at least 1 activity, first/last must not be undefined.
  const firstActivity = activities[0] as WebChatActivity;
  // eslint-disable-next-line no-magic-numbers
  const lastActivity = activities.at(-1) as WebChatActivity;

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
