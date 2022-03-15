import { Constants } from 'botframework-webchat-core';
import type { WebChatActivity } from 'botframework-webchat-core';

import GroupActivitiesMiddleware from '../../types/GroupActivitiesMiddleware';

const {
  ActivityClientState: { SENDING, SEND_FAILED, SENT }
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

function sending(activity) {
  if (activity.from.role === 'user') {
    const state = activity.channelData?.state;

    switch (state) {
      case SENDING:
      case SEND_FAILED:
        return state;

      default:
        return SENT;
    }
  }
}

function shouldGroupTimestamp(
  activityX: WebChatActivity,
  activityY: WebChatActivity,
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
