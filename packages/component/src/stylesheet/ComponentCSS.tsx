// TODO: [P2] This component can be replaced by `bindProps(InjectCSS)({ cssContent, identifier })`.
import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { Fragment, memo, type FunctionComponent } from 'react';
import { object, optional, pipe, readonly, string, undefinedable, type InferInput } from 'valibot';

import InjectStyleElements from '../Styles/InjectStyleElements';
import createComponentStyleElements from './createComponentStyleElements';

const componentCSSPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    nonce: undefinedable(string())
  }),
  readonly()
);

type ComponentCSSProps = InferInput<typeof componentCSSPropsSchema>;

const styleElements = createComponentStyleElements('component');

function ComponentCSS(props: ComponentCSSProps) {
  const { children, nonce } = validateProps(componentCSSPropsSchema, props);

  return (
    <Fragment>
      <InjectStyleElements nonce={nonce} styleElements={styleElements} />
      {children}
    </Fragment>
  );
}

ComponentCSS.displayName = 'ComponentCSS';

export default memo(ComponentCSS as FunctionComponent<ComponentCSSProps>);
export { componentCSSPropsSchema, type ComponentCSSProps };
