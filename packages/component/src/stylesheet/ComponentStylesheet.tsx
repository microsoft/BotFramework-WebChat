// TODO: [P2] This component can be replaced by `bindProps`.
import { InjectStyleElements } from '@msinternal/botframework-webchat-component-inject-style-elements';
import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyleOptions } from 'botframework-webchat-api/hook';
import React, { memo, type FunctionComponent } from 'react';
import { never, object, optional, pipe, readonly, string, undefinedable, type InferInput } from 'valibot';

import createComponentStyleElements from './createComponentStyleElements';

const componentStylesheetPropsSchema = pipe(
  object({
    children: optional(never()),
    nonce: undefinedable(string())
  }),
  readonly()
);

type ComponentStylesheetProps = InferInput<typeof componentStylesheetPropsSchema>;

const styleElements = createComponentStyleElements('component');

function ComponentStylesheet(props: ComponentStylesheetProps) {
  const { nonce } = validateProps(componentStylesheetPropsSchema, props);

  const [{ stylesRoot }] = useStyleOptions();

  return <InjectStyleElements at={stylesRoot} nonce={nonce} styleElements={styleElements} />;
}

ComponentStylesheet.displayName = 'ComponentStylesheet';

export default memo(ComponentStylesheet as FunctionComponent<ComponentStylesheetProps>);
export { componentStylesheetPropsSchema, type ComponentStylesheetProps };
