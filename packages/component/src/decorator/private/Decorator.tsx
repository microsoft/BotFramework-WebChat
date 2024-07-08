import { DecoratorComposer, type DecoratorMiddleware } from 'botframework-webchat-api/decorator';
import React, { memo, type ReactNode } from 'react';

import BorderFlair from './BorderFlair';
import BorderLoader from './BorderLoader';
import createStyles from './createStyles';
import ThemeProvider from '../../providers/Theme/ThemeProvider';

const middleware: DecoratorMiddleware[] = [
  init =>
    init === 'activity border' && (next => request => (request.state === 'completion' ? BorderFlair : next(request))),
  init =>
    init === 'activity border' && (next => request => (request.state === 'informative' ? BorderLoader : next(request)))
];

const styles = createStyles();

function WebChatDecorator({ children }: Readonly<{ readonly children?: ReactNode | undefined }>) {
  return (
    <ThemeProvider styles={styles}>
      <DecoratorComposer middleware={middleware}>{children}</DecoratorComposer>
    </ThemeProvider>
  );
}

export default memo(WebChatDecorator);