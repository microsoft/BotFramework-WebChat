import React from 'react';

import Timestamp from './Timestamp';

function sameTimestampGroup(activityX, activityY, groupTimestamp) {
  if (groupTimestamp === false) {
    // Hide timestamp for all activities
    return true;
  } else if (activityX && activityY && activityX.from && activityY.from) {
    groupTimestamp = typeof groupTimestamp === 'number' ? groupTimestamp : Infinity;

    if (activityX.from.role === activityY.from.role) {
      const timeX = new Date(activityX.timestamp).getTime();
      const timeY = new Date(activityY.timestamp).getTime();

      return Math.abs(timeX - timeY) <= groupTimestamp;
    }
  }

  return false;
}

export default function createTimestampMiddleware() {
  return () => next => ({ activity, groupTimestamp, nextActivity, ...args }) => {
    if (sameTimestampGroup(activity, nextActivity, groupTimestamp)) {
      return next({ activity, groupTimestamp, nextActivity, ...args });
    }

    return <Timestamp activity={activity} />;
  };
}
