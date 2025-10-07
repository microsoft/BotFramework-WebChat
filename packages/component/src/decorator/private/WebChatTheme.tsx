import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { memo } from 'react';
import { object, optional, pipe, readonly, string, undefinedable, type InferInput } from 'valibot';

import ThemeProvider from '../../providers/Theme/ThemeProvider';
import createStyles from './createStyles';

const webChatThemePropsSchema = pipe(
  object({
    children: optional(reactNode()),
    // `nonce` is intentionally undefinedable() instead of optional() to remind caller they need to pass nonce if they have one.
    nonce: undefinedable(string())
  }),
  readonly()
);

type WebChatThemeProps = InferInput<typeof webChatThemePropsSchema>;

const styles = createStyles('component/decorator');

function WebChatTheme(props: WebChatThemeProps) {
  const { children, nonce } = validateProps(webChatThemePropsSchema, props);

  return (
    <ThemeProvider nonce={nonce} styles={styles}>
      {children}
    </ThemeProvider>
  );
}

export default memo(WebChatTheme);
export { webChatThemePropsSchema, type WebChatThemeProps };
