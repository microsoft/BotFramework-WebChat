import { hooks } from 'botframework-webchat-api';
import React, { Fragment, memo } from 'react';

import { type GroupedRenderingActivities } from '../providers/GroupedRenderingActivities/GroupedRenderingActivities';
import SenderGrouping from '../providers/GroupedRenderingActivities/ui/SenderGrouping/SenderGrouping';
import StatusGrouping from '../providers/GroupedRenderingActivities/ui/StatusGrouping/StatusGrouping';
import useGroupedRenderingActivities from '../providers/GroupedRenderingActivities/useGroupedRenderingActivities';
import { type ActivityWithRenderer } from '../providers/RenderingActivities/ActivityWithRenderer';
import TranscriptActivity from './TranscriptActivity';

const { useGetKeyByActivity } = hooks;

type DefaultActivityGroupingProps = Readonly<{
  activitiesWithRenderer: readonly ActivityWithRenderer[];
}>;

const DefaultActivityGrouping = memo(({ activitiesWithRenderer }: DefaultActivityGroupingProps) => {
  const getKeyByActivity = useGetKeyByActivity();

  return (
    <Fragment>
      {activitiesWithRenderer.map(({ activity, renderActivity }) => (
        <TranscriptActivity activity={activity} key={getKeyByActivity(activity)} renderActivity={renderActivity} />
      ))}
    </Fragment>
  );
});

DefaultActivityGrouping.displayName = 'DefaultActivityGrouping';

type ActivityGroupProps = Readonly<{
  group: GroupedRenderingActivities;
}>;

const ActivityTreeGroup = memo(({ group }: ActivityGroupProps) => {
  // TODO: Add grouping container middleware.
  if (group.type === 'sender') {
    return (
      <SenderGrouping activitiesWithRenderer={group.activitiesWithRenderer}>
        {group.children.map(child => (
          <ActivityTreeGroup group={child} key={child.key} />
        ))}
      </SenderGrouping>
    );
  } else if (group.type === 'status') {
    return (
      <StatusGrouping activitiesWithRenderer={group.activitiesWithRenderer}>
        {group.children.map(child => (
          <ActivityTreeGroup group={child} key={child.key} />
        ))}
      </StatusGrouping>
    );
  }

  return <DefaultActivityGrouping activitiesWithRenderer={group.activitiesWithRenderer} />;
});

ActivityTreeGroup.displayName = 'ActivityTreeGroup';

const ActivityTree = () => {
  const [group] = useGroupedRenderingActivities();

  return (
    <Fragment>
      {group.map(child => (
        <ActivityTreeGroup group={child} key={child.key} />
      ))}
    </Fragment>
  );
};

ActivityTree.displayName = 'ActivityTree';

export default memo(ActivityTree);
