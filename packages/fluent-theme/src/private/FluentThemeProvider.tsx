import React, { memo, type ReactNode } from 'react';

import ThemeProvider from '../external/ThemeProvider';
import SendBox from '../components/sendbox/SendBox';
import WebchatTheme from '../components/Theme';

type Props = Readonly<{ children?: ReactNode | undefined }>;

const STYLE_OPTIONS = { bubbleBackground: '#fee' };

const sendBoxMiddleware = [() => () => () => SendBox];

const FluentThemeProvider = ({ children }: Props) => (
  <WebchatTheme>
    <ThemeProvider sendBoxMiddleware={sendBoxMiddleware} styleOptions={STYLE_OPTIONS}>
      {children}
    </ThemeProvider>
  </WebchatTheme>
);

export default memo(FluentThemeProvider);
