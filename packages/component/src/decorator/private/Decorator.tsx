import { DecoratorComposer, type DecoratorMiddleware } from 'botframework-webchat-api/decorator';
import React, { memo, type ReactNode } from 'react';

import ThemeProvider from '../../providers/Theme/ThemeProvider';
import BorderFlair from './BorderFlair';
import BorderLoader from './BorderLoader';
import createStyles from './createStyles';

const middleware: DecoratorMiddleware[] = [
  init =>
    init === 'activity border' &&
    (next => request => (request.livestreamingState === 'completing' ? BorderFlair : next(request))),
  init =>
    init === 'activity border' &&
    (next => request => (request.livestreamingState === 'preparing' ? BorderLoader : next(request)))
];

const styles = createStyles();

function WebChatDecorator({ children }: Readonly<{ readonly children?: ReactNode | undefined }>) {
  return (
    <ThemeProvider styles={styles}>
      <DecoratorComposer middleware={middleware}>{children}</DecoratorComposer>
    </ThemeProvider>
  );}

export default memo(WebChatDecorator);
