import { Components } from 'botframework-webchat-component';
import React, { memo, type ReactNode } from 'react';

import { TelephoneKeypadProvider } from '../components/telephoneKeypad';
import { WebChatDecorator } from '../components/decorator';
import { WebChatTheme } from '../components/theme';
import { SendBox } from '../components/sendBox';

const { ThemeProvider } = Components;

type Props = Readonly<{ children?: ReactNode | undefined }>;

const sendBoxMiddleware = [() => () => () => SendBox];

const FluentThemeProvider = ({ children }: Props) => (
  <WebChatTheme>
    <TelephoneKeypadProvider>
      <ThemeProvider sendBoxMiddleware={sendBoxMiddleware}>
        <WebChatDecorator>{children}</WebChatDecorator>
      </ThemeProvider>
    </TelephoneKeypadProvider>
  </WebChatTheme>
);

export default memo(FluentThemeProvider);
