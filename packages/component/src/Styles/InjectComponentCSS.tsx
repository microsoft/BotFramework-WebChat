import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { memo } from 'react';
import { object, optional, pipe, readonly, string, undefinedable, type InferInput } from 'valibot';

import { componentCSSContent } from '../cssContent';
import InjectCSS from './InjectCSS';

const injectComponentCSSPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    nonce: undefinedable(string())
  }),
  readonly()
);

type InjectComponentCSSProps = InferInput<typeof injectComponentCSSPropsSchema>;

function InjectComponentCSS(props: InjectComponentCSSProps) {
  const { children, nonce } = validateProps(injectComponentCSSPropsSchema, props);

  return (
    <InjectCSS cssContent={componentCSSContent} identifier="component" nonce={nonce}>
      {children}
    </InjectCSS>
  );
}

InjectComponentCSS.displayName = 'InjectComponentCSS';

export default memo(InjectComponentCSS);
export { injectComponentCSSPropsSchema, type InjectComponentCSSProps };
