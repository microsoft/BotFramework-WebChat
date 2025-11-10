import type { WebChatActivity } from 'botframework-webchat-core';
import React, { memo, useMemo, type ReactNode } from 'react';
import usePrevious from '../../hooks/internal/usePrevious';
import useActivities from '../../hooks/useActivities';
import ActivityListenerContext, { type ActivityListenerContextType } from './private/Context';

type Props = Readonly<{ children?: ReactNode | undefined }>;

const ActivityListenerComposer = memo(({ children }: Props) => {
  const [activities] = useActivities();
  const prevActivities = usePrevious<readonly WebChatActivity[]>(activities, []);

  const upsertedActivitiesState = useMemo<readonly [readonly WebChatActivity[]]>(() => {
    const upserts: WebChatActivity[] = [];

    for (const activity of activities) {
      prevActivities.includes(activity) || upserts.push(activity);
    }

    return Object.freeze([Object.freeze(upserts)]);
  }, [activities, prevActivities]);

  const context = useMemo<ActivityListenerContextType>(() => ({ upsertedActivitiesState }), [upsertedActivitiesState]);

  return <ActivityListenerContext.Provider value={context}>{children}</ActivityListenerContext.Provider>;
});

export default ActivityListenerComposer;
