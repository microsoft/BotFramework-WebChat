// TODO: [P2] This component can be replaced by `bindProps(InjectCSS)({ cssContent, identifier })`.
import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { makeCreateStyles } from '@msinternal/botframework-webchat-styles';
import React, { Fragment, memo, type FunctionComponent } from 'react';
import { object, optional, pipe, readonly, string, undefinedable, type InferInput } from 'valibot';

import InjectStyleElements from '../Styles/InjectStyleElements';
import { decoratorCSSContent } from './decoratorCSSContent';

const decoratorCSSPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    nonce: undefinedable(string())
  }),
  readonly()
);

type DecoratorCSSProps = InferInput<typeof decoratorCSSPropsSchema>;

const styleElements = makeCreateStyles(decoratorCSSContent)('component/decorator');

function DecoratorCSS(props: DecoratorCSSProps) {
  const { children, nonce } = validateProps(decoratorCSSPropsSchema, props);

  return (
    <Fragment>
      <InjectStyleElements nonce={nonce} styleElements={styleElements} />
      {children}
    </Fragment>
  );
}

DecoratorCSS.displayName = 'DecoratorCSS';

export default memo(DecoratorCSS as FunctionComponent<DecoratorCSSProps>);
export { decoratorCSSPropsSchema, type DecoratorCSSProps };
