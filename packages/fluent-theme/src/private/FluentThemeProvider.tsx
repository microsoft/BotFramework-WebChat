import type { ActivityMiddleware, AttachmentMiddleware } from 'botframework-webchat-api';
import { Components } from 'botframework-webchat-component';
import React, { memo, type ReactNode } from 'react';

import { ActivityDecorator } from '../components/activity';
import { ActivityToolbox } from '../components/activityToolbox';
import { isPreChatMessageActivity, PreChatMessageActivity } from '../components/preChatActivity';
import { PrimarySendBox } from '../components/sendBox';
import { TelephoneKeypadProvider } from '../components/telephoneKeypad';
import { WebChatTheme } from '../components/theme';
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

      const renderActivity = next(...args);

      return renderActivity
        ? (...args) => <ActivityDecorator activity={activity}>{renderActivity(...args)}</ActivityDecorator>
        : renderActivity;
    }
];

const attachmentMiddleware: AttachmentMiddleware[] = [
  () =>
    next =>
    (...args) => {
      const result = next(...args);
      const { activity } = args[0] || {};

      if (activity?.from.role === 'bot') {
        return (
          <div>
            {result}
            <ActivityToolbox activity={activity} />
          </div>
        );
      }

      return result;
    }
];

const sendBoxMiddleware = [() => () => () => PrimarySendBox];

const FluentThemeProvider = ({ children, variant = 'fluent' }: Props) => (
  <VariantComposer variant={variant}>
    <WebChatTheme>
      <TelephoneKeypadProvider>
        <ThemeProvider
          activityMiddleware={activityMiddleware}
          attachmentMiddleware={attachmentMiddleware}
          sendBoxMiddleware={sendBoxMiddleware}
        >
          {children}
        </ThemeProvider>
      </TelephoneKeypadProvider>
    </WebChatTheme>
  </VariantComposer>
);

export default memo(FluentThemeProvider);
