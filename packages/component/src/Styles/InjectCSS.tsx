import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { makeCreateStyles } from '@msinternal/botframework-webchat-styles';
import React, { memo, useMemo } from 'react';
import { object, optional, pipe, readonly, string, undefinedable, type InferInput } from 'valibot';
import { ThemeProvider } from '../boot/component';

const injectCSSPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    cssContent: string(),
    identifier: string(),
    // Intentionally undefinedable() instead of optional() to remind caller they should pass nonce.
    nonce: undefinedable(string())
  }),
  readonly()
);

type InjectCSSProps = InferInput<typeof injectCSSPropsSchema>;

function InjectCSS(props: InjectCSSProps) {
  const { children, cssContent, identifier, nonce } = validateProps(injectCSSPropsSchema, props);

  const styleElements = useMemo(() => {
    const styleElements = makeCreateStyles(cssContent)(identifier);

    nonce && styleElements.forEach(element => element.setAttribute('nonce', nonce));

    return styleElements;
  }, [cssContent, identifier, nonce]);

  return <ThemeProvider styles={styleElements}>{children}</ThemeProvider>;
}

InjectCSS.displayName = 'InjectBundledCSS';

export default memo(InjectCSS);
export { injectCSSPropsSchema, type InjectCSSProps };
