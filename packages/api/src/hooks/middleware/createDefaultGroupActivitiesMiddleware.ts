import { Constants, DirectLineActivity } from 'botframework-webchat-core';

import GroupActivitiesMiddleware from '../../types/GroupActivitiesMiddleware';

const {
  ActivityClientState: { SENT }
} = Constants;

function bin<T>(items: T[], grouping: (last: T, current: T) => boolean): T[][] {
  let lastBin: T[];
  const bins: T[][] = [];
  let lastItem: T;

  items.forEach(item => {
    if (lastItem && grouping(lastItem, item)) {
      lastBin.push(item);
    } else {
      lastBin = [item];
      bins.push(lastBin);
    }

    lastItem = item;
  });

  return bins;
}

function sending(activity: DirectLineActivity): boolean {
  return activity.from.role === 'user' && activity.channelData && activity.channelData.state !== SENT;
}

function shouldGroupTimestamp(
  activityX: DirectLineActivity,
  activityY: DirectLineActivity,
  groupTimestamp: boolean | number
): boolean {
  if (groupTimestamp === false) {
    // Hide timestamp for all activities.
    return true;
  } else if (activityX && activityY) {
    if (sending(activityX) !== sending(activityY)) {
      return false;
    }

    groupTimestamp = typeof groupTimestamp === 'number' ? groupTimestamp : Infinity;

    const timeX = new Date(activityX.timestamp).getTime();
    const timeY = new Date(activityY.timestamp).getTime();

    return Math.abs(timeX - timeY) <= groupTimestamp;
  }

  return false;
}

export default function createDefaultGroupActivityMiddleware({ groupTimestamp }): GroupActivitiesMiddleware {
  return () =>
    () =>
    ({ activities }) => ({
      sender: bin(activities, (x, y) => x.from.role === y.from.role),
      status: bin(activities, (x, y) => shouldGroupTimestamp(x, y, groupTimestamp))
    });
}
