import { hooks } from 'botframework-webchat';
import React, { memo, useCallback, useEffect, useRef } from 'react';
import { useRefFrom } from 'use-ref-from';

import useAssetURL from './private/useAssetURL';

const { useLocalizer, useShouldReduceMotion } = hooks;

type SlidingDotsProps = Readonly<{ className: string }>;

const SlidingDots = ({ className }: SlidingDotsProps) => {
  const [shouldReduceMotion] = useShouldReduceMotion();
  const [url] = useAssetURL('sliding dots');
  const localize = useLocalizer();
  const objectElementRef = useRef<HTMLObjectElement>(null);

  const altText = localize('TYPING_INDICATOR_ALT');
  const shouldReduceMotionRef = useRefFrom(shouldReduceMotion);

  const pauseAnimations = useCallback(() => {
    const contentDocument = objectElementRef.current?.contentDocument;
    const svgElement = contentDocument?.documentElement;
    const { SVGSVGElement } = contentDocument?.defaultView || {};

    SVGSVGElement && svgElement instanceof SVGSVGElement && svgElement.pauseAnimations();
  }, [objectElementRef]);

  const unpauseAnimations = useCallback(() => {
    const contentDocument = objectElementRef.current?.contentDocument;
    const svgElement = contentDocument?.documentElement;
    const { SVGSVGElement } = contentDocument?.defaultView || {};

    SVGSVGElement && svgElement instanceof SVGSVGElement && svgElement.unpauseAnimations();
  }, [objectElementRef]);

  const pauseOrUnpauseAnimations = useCallback(
    () => (shouldReduceMotionRef.current ? pauseAnimations() : unpauseAnimations()),
    [pauseAnimations, shouldReduceMotionRef, unpauseAnimations]
  );

  useEffect(pauseOrUnpauseAnimations, [
    pauseOrUnpauseAnimations,
    // Call "pauseOrUnpauseAnimations()" when "shouldReduceMotion" change.
    shouldReduceMotion
  ]);

  return (
    <object
      aria-label={altText}
      className={className}
      data={url.href}
      onLoad={pauseOrUnpauseAnimations}
      ref={objectElementRef}
      type="image/svg+xml"
    />
  );
};

SlidingDots.displayName = 'SlidingDots';

export default memo(SlidingDots);
