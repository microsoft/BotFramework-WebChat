import { SENDING, SENT } from '../../types/internal/SendStatus';
import GroupActivitiesMiddleware from '../../types/GroupActivitiesMiddleware';

import type { GlobalScopePonyfill, WebChatActivity } from 'botframework-webchat-core';
import type { SendStatus } from '../../types/internal/SendStatus';

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

function sending(activity: WebChatActivity): SendStatus | undefined {
  if (activity.from.role === 'user') {
    const {
      channelData: { state, 'webchat:send-status': sendStatus }
    } = activity;

    // `channelData.state` is being deprecated in favor of `channelData['webchat:send-status']`.
    // Please refer to #4362 for details. Remove on or after 2024-07-31.
    return sendStatus || (state === SENT ? SENT : SENDING);
  }
}

function shouldGroupTimestamp(
  activityX: WebChatActivity,
  activityY: WebChatActivity,
  groupTimestamp: boolean | number,
  { Date }: GlobalScopePonyfill
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

export default function createDefaultGroupActivitiesMiddleware({
  groupTimestamp,
  ponyfill
}: {
  groupTimestamp: boolean | number;
  ponyfill: GlobalScopePonyfill;
}): GroupActivitiesMiddleware {
  return () =>
    () =>
    ({ activities }) => ({
      sender: bin(activities, (x, y) => x.from.role === y.from.role),
      status: bin(activities, (x, y) => shouldGroupTimestamp(x, y, groupTimestamp, ponyfill))
    });
}
