import React, { memo, type ReactNode } from 'react';
import { type DirectLineJSBotConnection } from 'botframework-webchat-core';

import ActivityKeyerComposer from './private/ActivityKeyer/ActivityKeyerComposer';
import AllActivitiesComposer from './private/AllActivities/AllActivitiesComposer';
import LatestActivitiesComposer from './private/LatestActivities/LatestActivitiesComposer';

type Props = Readonly<{
  children?: ReactNode;
  readonly directLine: DirectLineJSBotConnection;
  readonly initialUserId?: string;
}>;

export default memo(({ children, directLine, initialUserId }: Props) => (
  <AllActivitiesComposer directLine={directLine} initialUserId={initialUserId}>
    <ActivityKeyerComposer>
      <LatestActivitiesComposer>{children}</LatestActivitiesComposer>
    </ActivityKeyerComposer>
  </AllActivitiesComposer>
));
