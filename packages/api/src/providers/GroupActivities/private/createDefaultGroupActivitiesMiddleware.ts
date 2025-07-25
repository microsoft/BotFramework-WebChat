import { getOrgSchemaMessage, type GlobalScopePonyfill, type WebChatActivity } from 'botframework-webchat-core';

import type GroupActivitiesMiddleware from '../../../types/GroupActivitiesMiddleware';
import { type SendStatus } from '../../../types/SendStatus';

function bin<T>(items: readonly T[], grouping: (last: T, current: T) => boolean): readonly (readonly T[])[] {
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

  for (const bin in bins) {
    Object.freeze(bin);
  }

  return Object.freeze(bins);
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
}: Readonly<{
  groupTimestamp: boolean | number;
  ponyfill: GlobalScopePonyfill;
}>): readonly GroupActivitiesMiddleware[] {
  return Object.freeze([
    type =>
      type === 'sender' || typeof type === 'undefined'
        ? next =>
            ({ activities }) => ({ ...next({ activities }), sender: bin(activities, shouldGroupSender) })
        : undefined,
    type =>
      type === 'status' || typeof type === 'undefined'
        ? next =>
            ({ activities }) => ({
              ...next({ activities }),
              status: bin(activities, createShouldGroupTimestamp(groupTimestamp, ponyfill))
            })
        : undefined,
    type =>
      type === 'part'
        ? next =>
            ({ activities }) => {
              const messages = activities.map(activity => [getOrgSchemaMessage(activity.entities), activity] as const);
              return {
                ...next({ activities }),
                part: bin(messages, ([last], [current]) => typeof last?.isPartOf?.[0]?.['@id'] === 'string' && last.isPartOf[0]['@id'] === current?.isPartOf?.[0]?.['@id'])
                  .map((bin) => bin.map(([, activity]) => activity))
              };
            }
        : undefined,
  ]);
}
