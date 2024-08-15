import type { ActivityMiddleware, AttachmentMiddleware } from 'botframework-webchat-api';
import { Components } from 'botframework-webchat-component';
import React, { Fragment, memo, type ReactNode } from 'react';

import { ActivityDecorator } from '../components/activity';
import { ActivityToolbox } from '../components/activityToolbox';
import { isPreChatMessageActivity, PreChatMessageActivity } from '../components/preChatActivity';
import { PrimarySendBox } from '../components/sendBox';
import { TelephoneKeypadProvider } from '../components/telephoneKeypad';
import { WebChatTheme } from '../components/theme';
import VariantComposer, { VariantList } from './VariantComposer';

const { ThemeProvider } = Components;

type Props = Readonly<{ children?: ReactNode | undefined; variant?: VariantList | undefined }>;

const activityMiddleware: readonly ActivityMiddleware[] = Object.freeze([
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
]);

const attachmentMiddleware: readonly AttachmentMiddleware[] = Object.freeze([
  () =>
    next =>
    (...args) => {
      const result = next(...args);
      const { activity, attachment } = args[0] || {};

      if (attachment && activity?.from.role === 'bot' && activity.type === 'message') {
        const attachments = Array.isArray(activity.attachments) ? activity.attachments : [];

        // Main text message is not an attachment inside the `attachments` field.
        if (!attachments.includes(attachment)) {
          return (
            <Fragment>
              {result}
              <ActivityToolbox activity={activity} />
            </Fragment>
          );
        }
      }

      return result;
    }
]);

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
