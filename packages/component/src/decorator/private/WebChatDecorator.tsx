import {
  createActivityBorderMiddleware,
  DecoratorComposer,
  type DecoratorMiddleware
} from 'botframework-webchat-api/decorator';
import { reactNode, validateProps } from 'botframework-webchat-react-valibot';
import React, { memo } from 'react';
import { object, optional, pipe, readonly, type InferInput } from 'valibot';

import BorderFlair from './BorderFlair';
import BorderLoader from './BorderLoader';
import WebChatTheme from './WebChatTheme';

const middleware: readonly DecoratorMiddleware[] = Object.freeze([
  createActivityBorderMiddleware(
    next => request => (request.livestreamingState === 'completing' ? BorderFlair : next(request))
  ),
  createActivityBorderMiddleware(
    next => request => (request.livestreamingState === 'preparing' ? BorderLoader : next(request))
  )
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
