import { Components } from 'botframework-webchat-component';
import React, { memo, type ReactNode } from 'react';

import type { ActivityMiddleware } from 'botframework-webchat-api';
import { isPreChatMessageActivity, PreChatMessageActivity } from '../components/preChatActivity';
import { PrimarySendBox } from '../components/sendBox';
import { TelephoneKeypadProvider } from '../components/telephoneKeypad';
import { WebChatTheme } from '../components/theme';
import { ActivityDecorator } from '../components/activity';
import VariantComposer, { VariantList } from './VariantComposer';

const { ThemeProvider } = Components;

type Props = Readonly<{ children?: ReactNode | undefined; variant?: VariantList | undefined }>;

const activityMiddleware: ActivityMiddleware[] = [
  () =>
    next =>
    (...args) => {
      const activity = args[0]?.activity;

      if (activity && isPreChatMessageActivity(activity)) {
        return () => <PreChatMessageActivity activity={activity} />;
      }

      const children = next(...args);
      return (...args) => (
        <ActivityDecorator activity={activity}>
          {children && children instanceof Function ? children(...args) : children}
        </ActivityDecorator>
      );
    }
];
const sendBoxMiddleware = [() => () => () => PrimarySendBox];

const FluentThemeProvider = ({ children, variant }: Props) => (
  <VariantComposer variant={variant}>
    <WebChatTheme>
      <TelephoneKeypadProvider>
        <ThemeProvider activityMiddleware={activityMiddleware} sendBoxMiddleware={sendBoxMiddleware}>
          {children}
        </ThemeProvider>
      </TelephoneKeypadProvider>
    </WebChatTheme>
  </VariantComposer>
);

export default memo(FluentThemeProvider);
