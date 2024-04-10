import { Components } from 'botframework-webchat-component';
import React, { memo, type ReactNode } from 'react';

import { TelephoneKeypadProvider } from '../components/TelephoneKeypad';
import WebChatTheme from '../components/Theme';
import SendBox from '../components/sendbox/SendBox';

const { ThemeProvider } = Components;

type Props = Readonly<{ children?: ReactNode | undefined }>;

const sendBoxMiddleware = [() => () => () => SendBox];

const FluentThemeProvider = ({ children }: Props) => (
  <WebChatTheme>
    <TelephoneKeypadProvider>
      <ThemeProvider sendBoxMiddleware={sendBoxMiddleware}>{children}</ThemeProvider>
    </TelephoneKeypadProvider>
  </WebChatTheme>
);

export default memo(FluentThemeProvider);
