import * as defaultAdaptiveCardsPackage from 'adaptivecards';
import PropTypes from 'prop-types';
import React, { type ReactNode, useMemo } from 'react';

import AdaptiveCardsContext from './AdaptiveCardsContext';
import AdaptiveCardsPackage from '../types/AdaptiveCardsPackage';

type AdaptiveCardsComposerProps = Readonly<{
  adaptiveCardsHostConfig: any;
  adaptiveCardsPackage: AdaptiveCardsPackage;
  children: ReactNode;
}>;

const AdaptiveCardsComposer = ({
  adaptiveCardsHostConfig,
  adaptiveCardsPackage,
  children
}: AdaptiveCardsComposerProps): ReactNode => {
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
