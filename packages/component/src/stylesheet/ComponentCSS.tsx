// TODO: [P2] This component can be replaced by `bindProps(InjectCSS)({ cssContent, identifier })`.
import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { makeCreateStyles } from '@msinternal/botframework-webchat-styles';
import React, { memo, useMemo } from 'react';
import { object, optional, pipe, readonly, string, undefinedable, type InferInput } from 'valibot';

import { InjectStyleElementsComposer } from '../boot/internal';
import { componentCSSContent } from '../cssContent';

const componentCSSPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    nonce: undefinedable(string())
  }),
  readonly()
);

type ComponentCSSProps = InferInput<typeof componentCSSPropsSchema>;

function ComponentCSS(props: ComponentCSSProps) {
  const { children, nonce } = validateProps(componentCSSPropsSchema, props);

  const styleElements = useMemo(() => {
    const styleElements = makeCreateStyles(componentCSSContent)('component');

    nonce && styleElements.forEach(element => element.setAttribute('nonce', nonce));

    return styleElements;
  }, [nonce]);

  return <InjectStyleElementsComposer styleElements={styleElements}>{children}</InjectStyleElementsComposer>;
}

ComponentCSS.displayName = 'ComponentCSS';

export default memo(ComponentCSS);
export { componentCSSPropsSchema, type ComponentCSSProps };
