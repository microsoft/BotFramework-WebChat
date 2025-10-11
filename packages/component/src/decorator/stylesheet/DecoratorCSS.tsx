// TODO: [P2] This component can be replaced by `bindProps(InjectCSS)({ cssContent, identifier })`.
import { InjectStyleElements } from '@msinternal/botframework-webchat-component-inject-style-elements';
import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyleOptions } from 'botframework-webchat-api/hook';
import React, { memo, type FunctionComponent } from 'react';
import { never, object, optional, pipe, readonly, string, undefinedable, type InferInput } from 'valibot';

import createDecoratorStyleElements from './createDecoratorStyleElements';

const decoratorCSSPropsSchema = pipe(
  object({
    children: optional(never()),
    nonce: undefinedable(string())
  }),
  readonly()
);

type DecoratorCSSProps = InferInput<typeof decoratorCSSPropsSchema>;

const styleElements = createDecoratorStyleElements('component/decorator');

function DecoratorCSS(props: DecoratorCSSProps) {
  const { nonce } = validateProps(decoratorCSSPropsSchema, props);

  const [{ stylesRoot }] = useStyleOptions();

  return <InjectStyleElements at={stylesRoot} nonce={nonce} styleElements={styleElements} />;
}

DecoratorCSS.displayName = 'DecoratorCSS';

export default memo(DecoratorCSS as FunctionComponent<DecoratorCSSProps>);
export { decoratorCSSPropsSchema, type DecoratorCSSProps };
