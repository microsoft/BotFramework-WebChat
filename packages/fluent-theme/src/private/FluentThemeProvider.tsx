import { Components } from 'botframework-webchat-component';
import React, { memo, type ReactNode } from 'react';

import SendBox from '../components/sendbox/SendBox';
import WebChatTheme from '../components/Theme';

const { ThemeProvider } = Components;

type Props = Readonly<{ children?: ReactNode | undefined }>;

const sendBoxMiddleware = [() => () => () => SendBox];

const FluentThemeProvider = ({ children }: Props) => (
  <WebChatTheme>
    <ThemeProvider sendBoxMiddleware={sendBoxMiddleware}>{children}</ThemeProvider>
  </WebChatTheme>
);

export default memo(FluentThemeProvider);
