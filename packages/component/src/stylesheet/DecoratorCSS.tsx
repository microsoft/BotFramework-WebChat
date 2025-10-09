// TODO: [P2] This component can be replaced by `bindProps(InjectCSS)({ cssContent, identifier })`.
import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { makeCreateStyles } from '@msinternal/botframework-webchat-styles';
import React, { memo, useMemo } from 'react';
import { object, optional, pipe, readonly, string, undefinedable, type InferInput } from 'valibot';

import { InjectStyleElementsComposer } from '../boot/internal';
import { decoratorCSSContent } from '../cssContent';

const decoratorCSSPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    nonce: undefinedable(string())
  }),
  readonly()
);

type DecoratorCSSProps = InferInput<typeof decoratorCSSPropsSchema>;

function DecoratorCSS(props: DecoratorCSSProps) {
  const { children, nonce } = validateProps(decoratorCSSPropsSchema, props);

  const styleElements = useMemo(() => {
    const styleElements = makeCreateStyles(decoratorCSSContent)('component/decorator');

    nonce && styleElements.forEach(element => element.setAttribute('nonce', nonce));

    return styleElements;
  }, [nonce]);

  return <InjectStyleElementsComposer styleElements={styleElements}>{children}</InjectStyleElementsComposer>;
}

DecoratorCSS.displayName = 'DecoratorCSS';

export default memo(DecoratorCSS);
export { decoratorCSSPropsSchema, type DecoratorCSSProps };
