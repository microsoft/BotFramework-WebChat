import { hooks } from 'botframework-webchat-api';
import React, { Fragment, memo, useMemo } from 'react';

import { type GroupedRenderingActivities } from '../providers/GroupedRenderingActivities/GroupedRenderingActivities';
import SenderGrouping from '../providers/GroupedRenderingActivities/ui/SenderGrouping/SenderGrouping';
import StatusGrouping from '../providers/GroupedRenderingActivities/ui/StatusGrouping/StatusGrouping';
import useGroupedRenderingActivities from '../providers/GroupedRenderingActivities/useGroupedRenderingActivities';
import TranscriptActivity from './TranscriptActivity';

const { useGetKeyByActivity } = hooks;

type ActivityGroupProps = Readonly<{
  group: GroupedRenderingActivities;
}>;

const ActivityGroup = memo(({ group }: ActivityGroupProps) => {
  const activities = useMemo(() => group.activitiesWithRenderer.map(({ activity }) => activity), [group]);
  const getKeyByActivity = useGetKeyByActivity();

  // TODO: Add grouping container middleware.
  if (group.type === 'sender') {
    return (
      <SenderGrouping activities={activities}>
        {group.children.map(child => (
          <ActivityGroup group={child} key={child.key} />
        ))}
      </SenderGrouping>
    );
  } else if (group.type === 'status') {
    return (
      <StatusGrouping activities={activities}>
        {group.children.map(child => (
          <ActivityGroup group={child} key={child.key} />
        ))}
      </StatusGrouping>
    );
  }

  return (
    <Fragment>
      {group.activitiesWithRenderer.map(({ activity, renderActivity }) => (
        <TranscriptActivity activity={activity} key={getKeyByActivity(activity)} renderActivity={renderActivity} />
      ))}
    </Fragment>
  );
});

ActivityGroup.displayName = 'ActivityGroup';

const ActivitiesWithGroupContainer = () => {
  const [group] = useGroupedRenderingActivities();

  return (
    <Fragment>
      {group.map(child => (
        <ActivityGroup group={child} key={child.key} />
      ))}
    </Fragment>
  );
};

ActivitiesWithGroupContainer.displayName = 'ActivitiesWithGroupContainer';

export default memo(ActivitiesWithGroupContainer);
