// TODO: [P2] This component can be replaced by `bindProps`.
import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyleOptions } from 'botframework-webchat-api/hook';
import { InjectStyleElements } from 'botframework-webchat-component/internal';
import React, { memo, type FunctionComponent } from 'react';
import { never, object, optional, pipe, readonly, string, undefinedable, type InferInput } from 'valibot';

import createFluentThemeStyleElements from './createFluentThemeStyleElements';

const fluentThemeStylesheetPropsSchema = pipe(
  object({
    children: optional(never()),
    nonce: undefinedable(string())
  }),
  readonly()
);

type FluentThemeStylesheetProps = InferInput<typeof fluentThemeStylesheetPropsSchema>;

const styleElements = createFluentThemeStyleElements('fluent-theme');

function FluentThemeStylesheet(props: FluentThemeStylesheetProps) {
  const { nonce } = validateProps(fluentThemeStylesheetPropsSchema, props);

  const [{ stylesRoot }] = useStyleOptions();

  return <InjectStyleElements at={stylesRoot} nonce={nonce} styleElements={styleElements} />;
}

FluentThemeStylesheet.displayName = 'FluentThemeStylesheet';

export default memo(FluentThemeStylesheet as FunctionComponent<FluentThemeStylesheetProps>);
export { fluentThemeStylesheetPropsSchema, type FluentThemeStylesheetProps };
