import { Components } from 'botframework-webchat-component';
import React, { memo, type ReactNode } from 'react';

import { TelephoneKeypadProvider } from '../components/telephoneKeypad';
import { WebChatTheme } from '../components/theme';
import { SendBox } from '../components/sendBox';

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
