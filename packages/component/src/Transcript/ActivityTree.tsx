import { ActivityGroupingDecorator } from 'botframework-webchat-api/decorator';
import React, { Fragment, memo } from 'react';

import { type GroupedRenderingActivities } from '../providers/GroupedRenderingActivities/GroupedRenderingActivities';
import useGroupedRenderingActivities from '../providers/GroupedRenderingActivities/useGroupedRenderingActivities';

type ActivityGroupProps = Readonly<{
  group: GroupedRenderingActivities;
}>;

const ActivityTreeGroup = memo(({ group }: ActivityGroupProps) => (
  <ActivityGroupingDecorator activities={group.activities} groupingName={group.groupingName}>
    {group.children.map(child => (
      <ActivityTreeGroup group={child} key={child.key} />
    ))}
  </ActivityGroupingDecorator>
));

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
