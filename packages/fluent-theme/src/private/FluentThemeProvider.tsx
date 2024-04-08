import { Components } from 'botframework-webchat-component';
import React, { memo, type ReactNode } from 'react';

import SendBox from './SendBox';

const { ThemeProvider } = Components;

type Props = Readonly<{ children?: ReactNode | undefined }>;

const STYLE_OPTIONS = { bubbleBackground: '#fee' };

const sendBoxMiddleware = [() => () => () => SendBox];

const FluentThemeProvider = ({ children }: Props) => (
  <ThemeProvider sendBoxMiddleware={sendBoxMiddleware} styleOptions={STYLE_OPTIONS}>
    {children}
  </ThemeProvider>
);

export default memo(FluentThemeProvider);
