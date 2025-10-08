import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { memo } from 'react';
import { object, optional, pipe, readonly, string, undefinedable, type InferInput } from 'valibot';

import { componentCSSContent } from '../../cssContent';
import InjectCSS from '../../Styles/InjectCSS';

const injectDecoratorCSSPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    nonce: undefinedable(string())
  }),
  readonly()
);

type InjectDecoratorCSSProps = InferInput<typeof injectDecoratorCSSPropsSchema>;

function InjectDecoratorCSS(props: InjectDecoratorCSSProps) {
  const { children, nonce } = validateProps(injectDecoratorCSSPropsSchema, props);

  return (
    <InjectCSS cssContent={componentCSSContent} identifier="component/decorator" nonce={nonce}>
      {children}
    </InjectCSS>
  );
}

InjectDecoratorCSS.displayName = 'InjectDecoratorCSS';

export default memo(InjectDecoratorCSS);
export { injectDecoratorCSSPropsSchema, type InjectDecoratorCSSProps };
