import { type WebChatActivity } from 'botframework-webchat-core';

export const activityGroupingDecoratorTypeName = 'activity grouping' as const;

export type ActivityGroupingDecoratorRequest = Readonly<{
  /**
   * Name of the grouping from the result of `groupActivitesMiddleware()`.
   */
  groupingName: string;
}>;

export type ActivityGroupingDecoratorProps = Readonly<{
  activities: readonly WebChatActivity[];
}>;
