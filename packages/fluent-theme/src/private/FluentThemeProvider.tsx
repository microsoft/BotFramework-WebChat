import React, { memo, type ReactNode } from 'react';

import ThemeProvider from '../external/ThemeProvider';
import SendBox from './SendBox';

type Props = Readonly<{ children?: ReactNode | undefined }>;

const STYLE_OPTIONS = { bubbleBackground: '#fee' };

const sendBoxMiddleware = [() => () => () => SendBox];

const FluentThemeProvider = ({ children }: Props) => (
  <ThemeProvider sendBoxMiddleware={sendBoxMiddleware} styleOptions={STYLE_OPTIONS}>
    {children}
  </ThemeProvider>
);

export default memo(FluentThemeProvider);
