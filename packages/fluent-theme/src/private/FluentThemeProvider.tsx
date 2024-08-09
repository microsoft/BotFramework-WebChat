import { Components } from 'botframework-webchat-component';
import React, { memo, type ReactNode } from 'react';

import type { ActivityMiddleware } from 'botframework-webchat-api';
import { ActivityToolbox } from '../components/activityToolbox';
import { isPreChatMessageActivity, PreChatMessageActivity } from '../components/preChatActivity';
import { PrimarySendBox } from '../components/sendBox';
import { TelephoneKeypadProvider } from '../components/telephoneKeypad';
import { WebChatTheme } from '../components/theme';

const { ThemeProvider } = Components;

type Props = Readonly<{ children?: ReactNode | undefined }>;

const activityMiddleware: ActivityMiddleware[] = [
  () =>
    next =>
    (...args) => {
      const activity = args[0]?.activity;

      if (activity && isPreChatMessageActivity(activity)) {
        return () => <PreChatMessageActivity activity={activity} />;
      }

      return next(...args);
    },
  () =>
    next =>
    (...args) => {
      const result = next(...args);
      const activity = args[0]?.activity;

      if (activity && activity.from.role === 'bot') {
        // TODO: Build a component.
        return (...args) => (
          <div>
            {result && result(...args)}
            <ActivityToolbox activity={activity} />
          </div>
        );
      }

      return result;
    }
];
const sendBoxMiddleware = [() => () => () => PrimarySendBox];

const FluentThemeProvider = ({ children }: Props) => (
  <WebChatTheme>
    <TelephoneKeypadProvider>
      <ThemeProvider activityMiddleware={activityMiddleware} sendBoxMiddleware={sendBoxMiddleware}>
        {children}
      </ThemeProvider>
    </TelephoneKeypadProvider>
  </WebChatTheme>
);

export default memo(FluentThemeProvider);
