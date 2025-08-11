import React, { memo, type ReactNode } from 'react';

import ThemeProvider from '../../providers/Theme/ThemeProvider';
import createStyles from './createStyles';

type WebChatThemeProps = Readonly<{
  readonly children?: ReactNode | undefined;
}>;

const styles = createStyles('component/decorator');

function WebChatTheme({ children }: WebChatThemeProps) {
  return <ThemeProvider styles={styles}>{children}</ThemeProvider>;
}

export default memo(WebChatTheme);
export { type WebChatThemeProps };
