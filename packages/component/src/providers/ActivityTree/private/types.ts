import type { ActivityComponentFactory } from 'botframework-webchat-api';
import type { DirectLineActivity } from 'botframework-webchat-core';

type ActivityWithRenderer = {
  activity: DirectLineActivity;
  renderActivity: Exclude<ReturnType<ActivityComponentFactory>, false>;
};

type ActivityTree = ActivityWithRenderer[][][];
type ReadonlyActivityTree = readonly (readonly (readonly ActivityWithRenderer[])[])[];

export type { ActivityTree, ActivityWithRenderer, ReadonlyActivityTree };
