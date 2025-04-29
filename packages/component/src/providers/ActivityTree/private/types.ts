import type { ActivityComponentFactory } from 'botframework-webchat-api';
import type { WebChatActivity } from 'botframework-webchat-core';

type ActivityWithRenderer = Readonly<{
  activity: WebChatActivity;
  renderActivity: Exclude<ReturnType<ActivityComponentFactory>, false>;
}>;

type ActivityTree = ActivityWithRenderer[][][];
type ReadonlyActivityTree = readonly (readonly (readonly ActivityWithRenderer[])[])[];

export type { ActivityTree, ActivityWithRenderer, ReadonlyActivityTree };
