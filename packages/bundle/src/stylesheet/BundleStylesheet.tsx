// TODO: [P2] This component can be replaced by `bindProps`.
import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { InjectStyleElements } from 'botframework-webchat-component/internal';
import { useStyleOptions } from 'botframework-webchat-component/hook';
import React, { memo, type FunctionComponent } from 'react';
import { never, object, optional, pipe, readonly, string, undefinedable, type InferInput } from 'valibot';

import createBundleStyleElements from './createBundleStyleElements';

const bundleStylesheetPropsSchema = pipe(
  object({
    children: optional(never()),
    nonce: undefinedable(string())
  }),
  readonly()
);

type BundleStylesheetProps = InferInput<typeof bundleStylesheetPropsSchema>;

const styleElements = createBundleStyleElements('bundle');

function BundleStylesheet(props: BundleStylesheetProps) {
  const { nonce } = validateProps(bundleStylesheetPropsSchema, props);

  const [{ stylesRoot }] = useStyleOptions();

  return <InjectStyleElements at={stylesRoot} nonce={nonce} styleElements={styleElements} />;
}

BundleStylesheet.displayName = 'BundleStylesheet';

export default memo(BundleStylesheet as FunctionComponent<BundleStylesheetProps>);
export { bundleStylesheetPropsSchema, type BundleStylesheetProps };
