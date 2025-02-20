import { type ActivityMiddleware, type StyleOptions } from 'botframework-webchat-api';
import { DecoratorComposer, DecoratorMiddleware } from 'botframework-webchat-api/decorator';
import { Components } from 'botframework-webchat-component';
import { WebChatDecorator } from 'botframework-webchat-component/decorator';
import React, { memo, type ReactNode } from 'react';

import { ActivityDecorator } from '../components/activity';
import ActivityLoader from '../components/activity/ActivityLoader';
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

const decoratorMiddleware: DecoratorMiddleware[] = [
  init =>
    init === 'activity border' &&
    (next => request => (request.livestreamingState === 'preparing' ? ActivityLoader : next(request)))
];

const styles = createStyles();

const fluentStyleOptions: StyleOptions = Object.freeze({
  feedbackActionsPlacement: 'activity-actions'
});

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
          <WebChatDecorator>
            <DecoratorComposer middleware={decoratorMiddleware}>{children}</DecoratorComposer>
          </WebChatDecorator>
        </ThemeProvider>
      </TelephoneKeypadProvider>
    </WebChatTheme>
  </VariantComposer>
);

export default memo(FluentThemeProvider);
