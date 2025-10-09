// TODO: [P2] This component can be replaced by `bindProps(InjectCSS)({ cssContent, identifier })`.
import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { makeCreateStyles } from '@msinternal/botframework-webchat-styles';
import { memo, type FunctionComponent } from 'react';
import { object, optional, pipe, readonly, string, undefinedable, type InferInput } from 'valibot';

import useInjectStyleElements from '../Styles/useInjectStyleElements';
import { componentCSSContent } from './componentCSSContent';

const componentCSSPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    nonce: undefinedable(string())
  }),
  readonly()
);

type ComponentCSSProps = InferInput<typeof componentCSSPropsSchema>;

const styleElements = makeCreateStyles(componentCSSContent)('component');

function ComponentCSS(props: ComponentCSSProps) {
  const { children, nonce } = validateProps(componentCSSPropsSchema, props);

  useInjectStyleElements({ nonce, styleElements });

  return children;
}

ComponentCSS.displayName = 'ComponentCSS';

export default memo(ComponentCSS as FunctionComponent<ComponentCSSProps>);
export { componentCSSPropsSchema, type ComponentCSSProps };
