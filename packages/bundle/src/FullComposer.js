import PropTypes from 'prop-types';
import React from 'react';

import AdaptiveCardsComposer from './adaptiveCards/AdaptiveCardsComposer';
import { Components } from 'botframework-webchat-component';

import useComposerProps from './useComposerProps';

const { Composer } = Components;

const FullComposer = props => {
  const { adaptiveCardsHostConfig, adaptiveCardsPackage, children, ...otherProps } = props;
  const composerProps = useComposerProps(props);

  return (
    <AdaptiveCardsComposer
      adaptiveCardsHostConfig={adaptiveCardsHostConfig}
      adaptiveCardsPackage={adaptiveCardsPackage}
    >
      <Composer {...otherProps} {...composerProps}>
        {children}
      </Composer>
    </AdaptiveCardsComposer>
  );
};

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
