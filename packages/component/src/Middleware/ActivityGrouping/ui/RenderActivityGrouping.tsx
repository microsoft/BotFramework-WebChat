import { hooks } from 'botframework-webchat-api';
import React, { Fragment, memo } from 'react';
import { type ActivityWithRenderer } from '../../../providers/RenderingActivities/ActivityWithRenderer';
import TranscriptActivity from '../../../Transcript/TranscriptActivity';

const { useGetKeyByActivity } = hooks;

type RenderActivityGrouping = Readonly<{
  activitiesWithRenderer: readonly ActivityWithRenderer[];
}>;

const RenderActivityGrouping = ({ activitiesWithRenderer }: RenderActivityGrouping) => {
  const getKeyByActivity = useGetKeyByActivity();

  return (
    <Fragment>
      {activitiesWithRenderer.map(({ activity, renderActivity }) => (
        <TranscriptActivity activity={activity} key={getKeyByActivity(activity)} renderActivity={renderActivity} />
      ))}
    </Fragment>
  );
};

RenderActivityGrouping.displayName = 'RenderActivityGrouping';

export default memo(RenderActivityGrouping);
