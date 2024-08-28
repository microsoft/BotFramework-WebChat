import { DecoratorComposer, type DecoratorMiddleware } from 'botframework-webchat-api/decorator';
import React, { memo, type ReactNode } from 'react';

import BorderFlair from './BorderFlair';
import BorderLoader from './BorderLoader';

const middleware: DecoratorMiddleware[] = [
  init =>
    init === 'activity border' &&
    (next => request => (request.livestreamingState === 'completing' ? BorderFlair : next(request))),
  init =>
    init === 'activity border' &&
    (next => request => (request.livestreamingState === 'preparing' ? BorderLoader : next(request)))
];

function WebChatDecorator({ children }: Readonly<{ readonly children?: ReactNode | undefined }>) {
  return <DecoratorComposer middleware={middleware}>{children}</DecoratorComposer>;
}

export default memo(WebChatDecorator);
