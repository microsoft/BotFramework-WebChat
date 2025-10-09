/* eslint-disable prefer-arrow-callback */
import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { type StyleOptions } from 'botframework-webchat';
import { ThemeProvider } from 'botframework-webchat/component';
import {
  createActivityBorderMiddleware,
  createActivityGroupingMiddleware,
  DecoratorComposer,
  WebChatDecorator,
  type DecoratorMiddleware
} from 'botframework-webchat/decorator';
import { type ActivityMiddleware, type TypingIndicatorMiddleware } from 'botframework-webchat/internal';
import React, { memo, useMemo } from 'react';
import { object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import ActivityLoader from '../components/activity/ActivityLoader';
import PartGroupDecorator from '../components/activity/PartGroupingDecorator';
import AssetComposer from '../components/assets/AssetComposer';
import { isLinerMessageActivity, LinerMessageActivity } from '../components/linerActivity';
import { isPreChatMessageActivity, PreChatMessageActivity } from '../components/preChatActivity';
import { PrimarySendBox } from '../components/sendBox';
import { TelephoneKeypadProvider } from '../components/telephoneKeypad';
import { WebChatTheme } from '../components/theme';
import SlidingDotsTypingIndicator from '../components/typingIndicator/SlidingDotsTypingIndicator';
import { createStyles } from '../styles';
import VariantComposer, { variantNameSchema } from './VariantComposer';

const fluentThemeProviderPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    nonce: optional(string()),
    variant: optional(variantNameSchema, 'fluent')
  }),
  readonly()
);

type FluentThemeProviderProps = InferInput<typeof fluentThemeProviderPropsSchema>;

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

      return next(...args);
    }
]);

const sendBoxMiddleware = [() => () => () => PrimarySendBox];

const decoratorMiddleware: readonly DecoratorMiddleware[] = Object.freeze([
  createActivityGroupingMiddleware(next => request => {
    if (request.groupingName === 'part') {
      return PartGroupDecorator;
    }
    return next(request);
  }),
  createActivityBorderMiddleware(function FluentBorderLoader({ request, Next, ...props }) {
    return (
      <ActivityLoader showLoader={props.showLoader ?? request.livestreamingState === 'preparing'}>
        <Next {...props} showLoader={false} />
      </ActivityLoader>
    );
  })
]);

const fluentStyleOptions: StyleOptions = Object.freeze({
  feedbackActionsPlacement: 'activity-actions'
});

const typingIndicatorMiddleware: readonly TypingIndicatorMiddleware[] = Object.freeze([
  () =>
    next =>
    (...args) =>
      args[0].visible ? <SlidingDotsTypingIndicator /> : next(...args)
] satisfies TypingIndicatorMiddleware[]);

function FluentThemeProvider(props: FluentThemeProviderProps) {
  const { children, nonce, variant } = validateProps(fluentThemeProviderPropsSchema, props);

  const styleElements = useMemo(() => {
    const styleElements = createStyles('fluent-theme');

    nonce && styleElements.forEach(element => element.setAttribute('nonce', nonce));

    return styleElements;
  }, [nonce]);

  return (
    <VariantComposer variant={variant}>
      <WebChatTheme>
        <TelephoneKeypadProvider>
          <ThemeProvider
            activityMiddleware={activityMiddleware}
            sendBoxMiddleware={sendBoxMiddleware}
            styleOptions={fluentStyleOptions}
            styles={styleElements}
            typingIndicatorMiddleware={typingIndicatorMiddleware}
          >
            <AssetComposer>
              {/*
                <Composer> is not set up yet, we have no place to send nonce.
                This is temporal, until we decided to fold <WebChatDecorator> back into <Composer>.
              */}
              <WebChatDecorator nonce={nonce}>
                <DecoratorComposer middleware={decoratorMiddleware}>{children}</DecoratorComposer>
              </WebChatDecorator>
            </AssetComposer>
          </ThemeProvider>
        </TelephoneKeypadProvider>
      </WebChatTheme>
    </VariantComposer>
  );
}

export default memo(FluentThemeProvider);
export { type FluentThemeProviderProps };
