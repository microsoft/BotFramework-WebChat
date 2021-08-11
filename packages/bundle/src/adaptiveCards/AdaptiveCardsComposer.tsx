import * as defaultAdaptiveCardsPackage from 'adaptivecards';
import PropTypes from 'prop-types';
import React, { FC, ReactNode, useMemo } from 'react';

import AdaptiveCardsContext from './AdaptiveCardsContext';
import AdaptiveCardsPackage from '../types/AdaptiveCardsPackage';

type AdaptiveCardsComposerProps = {
  adaptiveCardsHostConfig: any;
  adaptiveCardsPackage: AdaptiveCardsPackage;
  children: ReactNode;
};

const AdaptiveCardsComposer: FC<AdaptiveCardsComposerProps> = ({
  adaptiveCardsHostConfig,
  adaptiveCardsPackage,
  children
}) => {
  const patchedAdaptiveCardsPackage = useMemo(
    () => adaptiveCardsPackage || defaultAdaptiveCardsPackage,
    [adaptiveCardsPackage]
  );

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
