import { Components } from 'botframework-webchat-component';
import PropTypes from 'prop-types';
import React, { forwardRef } from 'react';

import AddFullBundle from './AddFullBundle';

import type { AddFullBundleProps } from './AddFullBundle';
import type { ComposerProps, ComposerRef } from 'botframework-webchat-component';

const { Composer } = Components;

type FullComposerProps = ComposerProps & AddFullBundleProps;

const FullComposer = forwardRef<ComposerRef, FullComposerProps>((props, ref) => (
  <AddFullBundle {...props}>
    {extraProps => (
      <Composer ref={ref} {...props} {...extraProps}>
        {props.children}
      </Composer>
    )}
  </AddFullBundle>
));

FullComposer.displayName = 'FullComposer';

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

export type { FullComposerProps, ComposerRef };
