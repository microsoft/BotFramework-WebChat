// TODO: [P2] This component can be replaced by `bindProps(InjectCSS)({ cssContent, identifier })`.
import { InjectStyleElements } from '@msinternal/botframework-webchat-component-inject-style-elements';
import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyleOptions } from 'botframework-webchat-api/hook';
import React, { memo, type FunctionComponent } from 'react';
import { never, object, optional, pipe, readonly, string, undefinedable, type InferInput } from 'valibot';

import createComponentStyleElements from './createComponentStyleElements';

const componentCSSPropsSchema = pipe(
  object({
    children: optional(never()),
    nonce: undefinedable(string())
  }),
  readonly()
);

type ComponentCSSProps = InferInput<typeof componentCSSPropsSchema>;

const styleElements = createComponentStyleElements('component');

function ComponentCSS(props: ComponentCSSProps) {
  const { nonce } = validateProps(componentCSSPropsSchema, props);

  const [{ stylesRoot }] = useStyleOptions();

  return <InjectStyleElements at={stylesRoot} nonce={nonce} styleElements={styleElements} />;
}

ComponentCSS.displayName = 'ComponentCSS';

export default memo(ComponentCSS as FunctionComponent<ComponentCSSProps>);
export { componentCSSPropsSchema, type ComponentCSSProps };
