import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import AdaptiveCardsComposer from './adaptiveCards/AdaptiveCardsComposer';
import { Components } from 'botframework-webchat-component';

import createAdaptiveCardsStyleSet from './adaptiveCards/Styles/createAdaptiveCardsStyleSet';

const { Composer } = Components;

const FullComposer = ({ adaptiveCardsHostConfig, adaptiveCardsPackage, children, styleOptions, ...otherProps }) => {
  const extraStyleSet = useMemo(() => createAdaptiveCardsStyleSet(styleOptions), [styleOptions]);

  return (
    <AdaptiveCardsComposer
      adaptiveCardsHostConfig={adaptiveCardsHostConfig}
      adaptiveCardsPackage={adaptiveCardsPackage}
      styleOptions={styleOptions}
    >
      <Composer extraStyleSet={extraStyleSet} styleOptions={styleOptions} {...otherProps}>
        {children}
      </Composer>
    </AdaptiveCardsComposer>
  );
};

FullComposer.defaultProps = {
  adaptiveCardsHostConfig: undefined,
  adaptiveCardsPackage: undefined,
  children: undefined,
  styleOptions: undefined,
  ...Composer.defaultProps
};

FullComposer.propTypes = {
  adaptiveCardsHostConfig: PropTypes.any,
  adaptiveCardsPackage: PropTypes.any,
  children: PropTypes.any,
  styleOptions: PropTypes.any,
  ...Composer.propTypes
};

export default FullComposer;
