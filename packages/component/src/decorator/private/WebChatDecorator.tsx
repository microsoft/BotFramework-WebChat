/* eslint-disable prefer-arrow-callback */
import {
  createActivityBorderMiddleware,
  DecoratorComposer,
  type DecoratorMiddleware
} from 'botframework-webchat-api/decorator';
import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { memo } from 'react';
import { object, optional, pipe, readonly, type InferInput } from 'valibot';

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
    children: optional(reactNode())
  }),
  readonly()
);

type WebChatDecoratorProps = InferInput<typeof webChatDecoratorPropsSchema>;

function WebChatDecorator(props: WebChatDecoratorProps) {
  const { children } = validateProps(webChatDecoratorPropsSchema, props);

  return (
    <WebChatTheme>
      <DecoratorComposer middleware={middleware}>{children}</DecoratorComposer>
    </WebChatTheme>
  );
}

export default memo(WebChatDecorator);
export { webChatDecoratorPropsSchema, type WebChatDecoratorProps };
