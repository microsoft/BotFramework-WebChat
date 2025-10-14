// TODO: [P2] This component can be replaced by `bindProps`.
import { InjectStyleElements } from '@msinternal/botframework-webchat-styles/react';
import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyleOptions } from 'botframework-webchat-api/hook';
import React, { memo, type FunctionComponent } from 'react';
import { never, object, optional, pipe, readonly, string, undefinedable, type InferInput } from 'valibot';

import createDecoratorStyleElements from './createDecoratorStyleElements';

const decoratorStylesheetPropsSchema = pipe(
  object({
    children: optional(never()),
    nonce: undefinedable(string())
  }),
  readonly()
);

type DecoratorStylesheetProps = InferInput<typeof decoratorStylesheetPropsSchema>;

const styleElements = createDecoratorStyleElements('component/decorator');

function DecoratorStylesheet(props: DecoratorStylesheetProps) {
  const { nonce } = validateProps(decoratorStylesheetPropsSchema, props);

  const [{ stylesRoot }] = useStyleOptions();

  return <InjectStyleElements at={stylesRoot} nonce={nonce} styleElements={styleElements} />;
}

DecoratorStylesheet.displayName = 'DecoratorStylesheet';

export default memo(DecoratorStylesheet as FunctionComponent<DecoratorStylesheetProps>);
export { decoratorStylesheetPropsSchema, type DecoratorStylesheetProps };
