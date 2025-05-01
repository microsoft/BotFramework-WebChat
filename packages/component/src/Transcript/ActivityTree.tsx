import React, { Fragment, memo, useMemo } from 'react';

import { ActivityGroupingDecorator } from 'botframework-webchat-api/decorator';
import { type GroupedRenderingActivities } from '../providers/GroupedRenderingActivities/GroupedRenderingActivities';
import useGroupedRenderingActivities from '../providers/GroupedRenderingActivities/useGroupedRenderingActivities';

type ActivityGroupProps = Readonly<{
  group: GroupedRenderingActivities;
}>;

const ActivityTreeGroup = memo(({ group }: ActivityGroupProps) => {
  const activities = useMemo(() => group.activitiesWithRenderer.map(({ activity }) => activity), [group]);

  return (
    <ActivityGroupingDecorator
      activities={activities}
      activitiesWithRenderer={group.activitiesWithRenderer}
      type={group.type}
    >
      {group.children.map(child => (
        <ActivityTreeGroup group={child} key={child.key} />
      ))}
    </ActivityGroupingDecorator>
  );
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
