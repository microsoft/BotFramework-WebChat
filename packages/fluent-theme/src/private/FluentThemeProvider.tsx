import { type ActivityMiddleware, type StyleOptions } from 'botframework-webchat-api';
import { Components } from 'botframework-webchat-component';
import { WebChatDecorator } from 'botframework-webchat-component/decorator';
import React, { memo, type ReactNode } from 'react';

import { ActivityDecorator } from '../components/activity';
import { isPreChatMessageActivity, PreChatMessageActivity } from '../components/preChatActivity';
import { PrimarySendBox } from '../components/sendBox';
import { TelephoneKeypadProvider } from '../components/telephoneKeypad';
import { WebChatTheme } from '../components/theme';
import { createStyles } from '../styles';
import VariantComposer, { VariantList } from './VariantComposer';
import { isLinerMessageActivity, LinerMessageActivity } from '../components/linerActivity';

const { ThemeProvider } = Components;

type Props = Readonly<{ children?: ReactNode | undefined; variant?: VariantList | undefined }>;

const activityMiddleware: readonly ActivityMiddleware[] = Object.freeze([
  () =>
    next =>
    (...args) => {
      const activity = args[0]?.activity;

      // TODO: Should show pre-chat only when it is the very first message in the chat history.
      if (isPreChatMessageActivity(activity)) {
        return () => <PreChatMessageActivity activity={activity} />;
      }

      if (isLinerMessageActivity(activity)) {
        return () => <LinerMessageActivity activity={activity} />;
      }

      const renderActivity = next(...args);

      return renderActivity
        ? (...args) => <ActivityDecorator activity={activity}>{renderActivity(...args)}</ActivityDecorator>
        : renderActivity;
    }
]);

const sendBoxMiddleware = [() => () => () => PrimarySendBox];

const styles = createStyles();

const fluentStyleOptions: StyleOptions = {
  feedbackActionsPlacement: 'activity-actions'
};

const FluentThemeProvider = ({ children, variant = 'fluent' }: Props) => (
  <VariantComposer variant={variant}>
    <WebChatTheme>
      <TelephoneKeypadProvider>
        <ThemeProvider
          activityMiddleware={activityMiddleware}
          sendBoxMiddleware={sendBoxMiddleware}
          styleOptions={fluentStyleOptions}
          styles={styles}
        >
          <WebChatDecorator>{children}</WebChatDecorator>
        </ThemeProvider>
      </TelephoneKeypadProvider>
    </WebChatTheme>
  </VariantComposer>
);

export default memo(FluentThemeProvider);
