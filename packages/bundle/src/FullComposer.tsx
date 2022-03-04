import { ComposerProps } from 'botframework-webchat-api';
import { Components } from 'botframework-webchat-component';
import PropTypes from 'prop-types';
import React, { FC } from 'react';

import AddFullBundle, { AddFullBundleProps } from './AddFullBundle';

const { Composer } = Components;

type FullComposerProps = ComposerProps & AddFullBundleProps;

const FullComposer: FC<FullComposerProps> = props => (
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
