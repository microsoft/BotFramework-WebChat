import { DecoratorComposer, type DecoratorMiddleware } from 'botframework-webchat-api/decorator';
import React, { memo, type ReactNode } from 'react';

import BorderFlair from './BorderFlair';
import BorderLoader from './BorderLoader';
import WebChatTheme from './WebChatTheme';

const middleware: readonly DecoratorMiddleware[] = Object.freeze([
  init =>
    init === 'activity border' &&
    (next => request => (request.livestreamingState === 'completing' ? BorderFlair : next(request))),
  init =>
    init === 'activity border' &&
    (next => request => (request.livestreamingState === 'preparing' ? BorderLoader : next(request)))
]);

type WebChatDecoratorProps = Readonly<{
  readonly children?: ReactNode | undefined;
}>;

function WebChatDecorator({ children }: WebChatDecoratorProps) {
  return (
    <WebChatTheme>
      <DecoratorComposer middleware={middleware}>{children}</DecoratorComposer>
    </WebChatTheme>
  );
}

export default memo(WebChatDecorator);
export { type WebChatDecoratorProps };
