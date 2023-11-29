import { type DirectLineJSBotConnection } from 'botframework-webchat-core';
import React, { memo, type ReactNode } from 'react';

import ActivitiesComposer from './Activities/ActivitiesComposer';
import ActivityAcknowledgementComposer from './ActivityAcknowledgement/ActivityAcknowledgementComposer';

type Props = Readonly<{
  children?: ReactNode;
  readonly directLine: DirectLineJSBotConnection;
  readonly initialUserId?: string;
}>;

const APIProvider = memo(({ children, directLine, initialUserId }: Props) => (
  <ActivitiesComposer directLine={directLine} initialUserId={initialUserId}>
    <ActivityAcknowledgementComposer>
      {/* We should add <ActivitySendStatusComposer> and <ActivitySendStatusTelemetryComposer> */}
      {children}
    </ActivityAcknowledgementComposer>
  </ActivitiesComposer>
));

APIProvider.displayName = 'APIProvider';

export default APIProvider;
