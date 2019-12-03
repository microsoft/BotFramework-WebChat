import * as defaultAdaptiveCardsPackage from 'adaptivecards';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import AdaptiveCardsContext from './AdaptiveCardsContext';

const AdaptiveCardsComposer = ({ adaptiveCardsHostConfig, adaptiveCardsPackage, children }) => {
  const patchedAdaptiveCardsPackage = useMemo(() => adaptiveCardsPackage || defaultAdaptiveCardsPackage, [
    adaptiveCardsPackage
  ]);

  const adaptiveCardsContext = useMemo(
    () => ({
      adaptiveCardsPackage: patchedAdaptiveCardsPackage,
      hostConfigFromProps: adaptiveCardsHostConfig
    }),
    [adaptiveCardsHostConfig, patchedAdaptiveCardsPackage]
  );

  return <AdaptiveCardsContext.Provider value={adaptiveCardsContext}>{children}</AdaptiveCardsContext.Provider>;
};

AdaptiveCardsComposer.defaultProps = {
  adaptiveCardsHostConfig: undefined,
  adaptiveCardsPackage: undefined,
  children: undefined
};

AdaptiveCardsComposer.propTypes = {
  adaptiveCardsHostConfig: PropTypes.any,
  adaptiveCardsPackage: PropTypes.any,
  children: PropTypes.any
};

export default AdaptiveCardsComposer;
