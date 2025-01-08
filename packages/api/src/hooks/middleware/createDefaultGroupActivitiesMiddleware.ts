import type GroupActivitiesMiddleware from '../../types/GroupActivitiesMiddleware';

import { type GlobalScopePonyfill, type WebChatActivity } from 'botframework-webchat-core';
import { type SendStatus } from '../../types/SendStatus';

function bin<T>(items: T[], grouping: (last: T, current: T) => boolean): T[][] {
  let lastBin: T[];
  const bins: T[][] = [];
  let lastItem: T;

  for (const item of items) {
    if (lastItem && grouping(lastItem, item)) {
      lastBin.push(item);
    } else {
      lastBin = [item];
      bins.push(lastBin);
    }

    lastItem = item;
  }

  return bins;
}

function sending(activity: WebChatActivity): SendStatus | undefined {
  if (activity.from.role === 'user') {
    const {
      channelData: { 'webchat:send-status': sendStatus }
    } = activity;

    return sendStatus;
  }
}

function createShouldGroupTimestamp(groupTimestamp: boolean | number, { Date }: GlobalScopePonyfill) {
  return (activityX: WebChatActivity, activityY: WebChatActivity): boolean => {
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
  };
}

function shouldGroupSender(x: WebChatActivity, y: WebChatActivity): boolean {
  const {
    from: { role: roleX, id: idX }
  } = x;
  const {
    from: { role: roleY, id: idY }
  } = y;
  return roleX === roleY && idX === idY;
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
      sender: bin(activities, shouldGroupSender),
      status: bin(activities, createShouldGroupTimestamp(groupTimestamp, ponyfill))
    });
}
