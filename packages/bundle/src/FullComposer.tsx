import { Components } from 'botframework-webchat-component';
import PropTypes from 'prop-types';
import React, { type ReactNode } from 'react';

import AddFullBundle from './AddFullBundle';

import { type AddFullBundleProps } from './AddFullBundle';
import { type ComposerProps } from 'botframework-webchat-component';

const { Composer } = Components;

type FullComposerProps = ComposerProps & Readonly<AddFullBundleProps>;

const FullComposer = (props: FullComposerProps): ReactNode => (
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
