import { WebChatActivity, getActivityLivestreamingMetadata } from 'botframework-webchat-core';
import { useMemo } from 'react';
import { ActivityDecoratorRequest } from '..';

const supportedActivityRoles: ActivityDecoratorRequest['from'][] = ['bot', 'channel', 'user', undefined];

export default function useActivityDecoratorRequest(activity: WebChatActivity) {
  return useMemo<ActivityDecoratorRequest>(() => {
    const { type } = getActivityLivestreamingMetadata(activity) || {};

    return {
      activity,
      livestreamingState:
        type === 'final activity'
          ? 'completing'
          : type === 'informative message'
            ? 'preparing'
            : type === 'interim activity'
              ? 'ongoing'
              : undefined,
      from: supportedActivityRoles.includes(activity?.from?.role) ? activity?.from?.role : undefined
    };
  }, [activity]);
}
