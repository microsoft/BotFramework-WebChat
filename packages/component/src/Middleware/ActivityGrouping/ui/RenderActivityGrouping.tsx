import { hooks } from 'botframework-webchat-api';
import { type WebChatActivity } from 'botframework-webchat-core';
import React, { Fragment, memo } from 'react';
import useGetRenderActivityCallback from '../../../providers/RenderingActivities/useGetRenderActivityCallback';
import TranscriptActivity from '../../../Transcript/TranscriptActivity';

const { useGetKeyByActivity } = hooks;

type RenderActivityGroupingProps = Readonly<{
  activities: readonly WebChatActivity[];
}>;

const RenderActivityGrouping = ({ activities }: RenderActivityGroupingProps) => {
  const getKeyByActivity = useGetKeyByActivity();
  const getRenderActivityCallback = useGetRenderActivityCallback();

  return (
    <Fragment>
      {activities.map(activity => (
        <TranscriptActivity
          activity={activity}
          key={getKeyByActivity(activity)}
          renderActivity={getRenderActivityCallback(activity)}
        />
      ))}
    </Fragment>
  );
};

RenderActivityGrouping.displayName = 'RenderActivityGrouping';

export default memo(RenderActivityGrouping);
export { type RenderActivityGroupingProps };
