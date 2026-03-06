import { hooks } from 'botframework-webchat';
import React, { memo } from 'react';

import useAssetURL from './private/useAssetURL';

const { useLocalizer, useShouldReduceMotion } = hooks;

type SlidingDotsProps = Readonly<{ className: string }>;

const SlidingDots = ({ className }: SlidingDotsProps) => {
  const [shouldReduceMotion] = useShouldReduceMotion();
  const [url] = useAssetURL(shouldReduceMotion ? 'sliding dots reduced-motion' : 'sliding dots');
  const localize = useLocalizer();

  const altText = localize('TYPING_INDICATOR_ALT');

  return <img alt={altText} className={className} src={url.href} />;
};

SlidingDots.displayName = 'SlidingDots';

export default memo(SlidingDots);
