import * as defaultAdaptiveCardsPackage from 'adaptivecards';
import React, { useMemo, type ReactNode } from 'react';

import { type AdaptiveCardsPackage } from '../types/AdaptiveCardsPackage';
import AdaptiveCardsContext from './AdaptiveCardsContext';

type AdaptiveCardsComposerProps = Readonly<{
  adaptiveCardsHostConfig: any;
  adaptiveCardsPackage: AdaptiveCardsPackage;
  children?: ReactNode | undefined;
}>;

const AdaptiveCardsComposer = ({
  adaptiveCardsHostConfig,
  adaptiveCardsPackage,
  children
}: AdaptiveCardsComposerProps) => {
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

export default AdaptiveCardsComposer;
