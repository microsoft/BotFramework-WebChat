/* eslint-disable prefer-arrow-callback */
import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import {
  createActivityBorderMiddleware,
  DecoratorComposer,
  type DecoratorMiddleware
} from 'botframework-webchat-api/decorator';
import React, { memo } from 'react';
import { object, optional, pipe, readonly, string, undefinedable, type InferInput } from 'valibot';

import BorderFlair from './BorderFlair';
import BorderLoader from './BorderLoader';
import WebChatTheme from './WebChatTheme';

const middleware: readonly DecoratorMiddleware[] = Object.freeze([
  createActivityBorderMiddleware(function BorderFlairDecorator({ request, Next, ...props }) {
    return (
      <BorderFlair showFlair={props.showFlair ?? request.livestreamingState === 'completing'}>
        <Next {...props} showFlair={false} />
      </BorderFlair>
    );
  }),
  createActivityBorderMiddleware(function BorderLoaderDecorator({ request, Next, ...props }) {
    return (
      <BorderLoader showLoader={props.showLoader ?? request.livestreamingState === 'preparing'}>
        <Next {...props} showLoader={false} />
      </BorderLoader>
    );
  })
]);

const webChatDecoratorPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    // `nonce` is intentionally undefinedable() instead of optional() to remind caller they need to pass nonce if they have one.
    nonce: undefinedable(string())
  }),
  readonly()
);

type WebChatDecoratorProps = InferInput<typeof webChatDecoratorPropsSchema>;

function WebChatDecorator(props: WebChatDecoratorProps) {
  const { children, nonce } = validateProps(webChatDecoratorPropsSchema, props);

  return (
    <WebChatTheme nonce={nonce}>
      <DecoratorComposer middleware={middleware}>{children}</DecoratorComposer>
    </WebChatTheme>
  );
}

export default memo(WebChatDecorator);
export { webChatDecoratorPropsSchema, type WebChatDecoratorProps };
