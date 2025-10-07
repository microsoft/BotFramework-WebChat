import { reactNode } from '@msinternal/botframework-webchat-react-valibot';
import React, { memo } from 'react';
import { object, optional, pipe, readonly, type InferInput } from 'valibot';

import useNonce from '../hooks/internal/useNonce';
import ThemeProvider from '../providers/Theme/ThemeProvider';
import createStyles from './createStyles';

const webChatThemePropsSchema = pipe(
  object({
    children: optional(reactNode())
  }),
  readonly()
);

type WebChatThemeProps = InferInput<typeof webChatThemePropsSchema>;

const styles = createStyles('component');

function WebChatTheme({ children }: WebChatThemeProps) {
  const [nonce] = useNonce();

  return (
    <ThemeProvider nonce={nonce} styles={styles}>
      {children}
    </ThemeProvider>
  );
}

export default memo(WebChatTheme);
export { webChatThemePropsSchema, type WebChatThemeProps };
