import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { memo, useMemo } from 'react';
import { object, optional, pipe, readonly, string, undefinedable, type InferInput } from 'valibot';

import ThemeProvider from '../providers/Theme/ThemeProvider';
import createStyles from './createStyles';

const webChatThemePropsSchema = pipe(
  object({
    children: optional(reactNode()),
    nonce: undefinedable(string())
  }),
  readonly()
);

type WebChatThemeProps = InferInput<typeof webChatThemePropsSchema>;

function WebChatTheme(props: WebChatThemeProps) {
  const { children, nonce } = validateProps(webChatThemePropsSchema, props);

  const styleElements = useMemo(() => {
    const styleElements = createStyles('component');

    nonce && styleElements.forEach(element => element.setAttribute('nonce', nonce));

    return styleElements;
  }, [nonce]);

  return <ThemeProvider styles={styleElements}>{children}</ThemeProvider>;
}

export default memo(WebChatTheme);
export { webChatThemePropsSchema, type WebChatThemeProps };
