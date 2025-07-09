import { Components, type ComposerProps, type ComposerRef } from 'botframework-webchat-component';
import PropTypes from 'prop-types';
import React, { forwardRef } from 'react';

import AddFullBundle, { type AddFullBundleProps } from './AddFullBundle';

const { Composer } = Components;

type FullComposerProps = ComposerProps & AddFullBundleProps;

const FullComposer = forwardRef<ComposerRef, FullComposerProps>((props, ref) => (
  <AddFullBundle {...props}>
    {extraProps => (
      <Composer ref={ref} {...props} {...extraProps}>
        {/* We need to spread, thus, we cannot we destructuring assignment. */}
        {props.children}
      </Composer>
    )}
  </AddFullBundle>
));

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
