import { Components, type ComposerProps } from 'botframework-webchat-component';
import React from 'react';
import AddFullBundle, { type AddFullBundleProps, type AddFullBundleChildren } from './AddFullBundle';

const { Composer } = Components;

type BaseFullComposerProps = ComposerProps & AddFullBundleProps;

type ComposerPropsChildren = ComposerProps['children'];

/* The props of FullComposer are the union of Composer and AddFullBundle, except "children".
 * The union type of ComposerProps and AddFullBundleProps was not resolving correctly, so manually constructing the type here.
 */
type FullComposerProps = Omit<BaseFullComposerProps, 'children'> & {
  readonly children?: ComposerPropsChildren | AddFullBundleChildren | undefined;
};

const FullComposer = (props: FullComposerProps) => (
  <AddFullBundle {...props}>
    {extraProps => (
      <Composer {...props} {...extraProps}>
        {/* We need to spread, thus, we cannot we destructuring assignment. */}
        {/* eslint-disable-next-line react/destructuring-assignment */}
        {props.children}
      </Composer>
    )}
  </AddFullBundle>
);

export default FullComposer;

export type { FullComposerProps };
