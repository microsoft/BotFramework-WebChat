import { hooks } from 'botframework-webchat-api';
import { type WebChatActivity } from 'botframework-webchat-core';
import React, { memo, useCallback, useMemo } from 'react';
import useActivityElementMapRef from '../../../providers/ChatHistoryDOM/useActivityElementRef';
import useActivityRendererMap from '../../../providers/RenderingActivities/useActivityRendererMap';
import ActivityRow from '../../../Transcript/ActivityRow';

const { useGetKeyByActivity } = hooks;

function RenderActivity({ activity }: { readonly activity: WebChatActivity }) {
  const activityElementMapRef = useActivityElementMapRef();
  const getKeyByActivity = useGetKeyByActivity();

  const activityKey: string = useMemo(() => getKeyByActivity(activity), [activity, getKeyByActivity]);
  const activityCallbackRef = useCallback(
    (activityElement: HTMLElement) => {
      activityElement
        ? activityElementMapRef.current.set(activityKey, activityElement)
        : activityElementMapRef.current.delete(activityKey);
    },
    [activityElementMapRef, activityKey]
  );

  const [activityRendererMap] = useActivityRendererMap();
  const children = activityRendererMap.get(activity)?.({});

  return (
    <ActivityRow activity={activity} ref={activityCallbackRef}>
      {children}
    </ActivityRow>
  );
}

export default memo(RenderActivity);
