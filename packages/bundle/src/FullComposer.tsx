import { Components, type ComposerProps } from 'botframework-webchat-component';
import PropTypes from 'prop-types';
import React from 'react';
import type { ComposerCoreChildrenRenderProp } from 'botframework-webchat-api';
import AddFullBundle, { type AddFullBundleProps, type AddFullBundleChildren } from './AddFullBundle';

const { Composer } = Components;

type BaseFullComposerProps = ComposerProps & AddFullBundleProps;

/* The props of FullComposer are the union of Composer and AddFullBundle, except "children".
 * The union type of ComposerProps and AddFullBundleProps was not resolving correctly, so manually constructing the type here.
 */
type FullComposerProps = Omit<BaseFullComposerProps, 'children'> & {
  children?: React.ReactNode | ComposerCoreChildrenRenderProp | AddFullBundleChildren;
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

FullComposer.defaultProps = {
  ...Composer.defaultProps,
  adaptiveCardsHostConfig: undefined,
  adaptiveCardsPackage: undefined,
  children: undefined
};

FullComposer.propTypes = {
  ...Composer.propTypes,
  adaptiveCardsHostConfig: PropTypes.any,
  adaptiveCardsPackage: PropTypes.any,
  children: PropTypes.any
};

export default FullComposer;

export type { FullComposerProps };
