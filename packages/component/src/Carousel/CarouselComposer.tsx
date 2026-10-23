import { CarouselComposer as HeadlessCarouselComposer } from '@msinternal/botframework-webchat-component-carousel';
import { reactNode, validateProps, type InferReactProps } from '@msinternal/botframework-webchat-react-valibot';
import { hooks } from 'botframework-webchat-api';
import React, { memo, useMemo } from 'react';
import { object, optional, pipe, readonly } from 'valibot';

const { usePonyfill } = hooks;

const carouselComposerPropsSchema = pipe(
  object({
    children: optional(reactNode())
  }),
  readonly()
);

type CarouselComposerProps = InferReactProps<typeof carouselComposerPropsSchema>;

/** The headless carousel, with Web Chat's clock functions. */
function CarouselComposer(props: CarouselComposerProps) {
  const { children } = validateProps(carouselComposerPropsSchema, props);

  const [{ clearTimeout, setTimeout }] = usePonyfill();

  const ponyfill = useMemo(() => Object.freeze({ clearTimeout, setTimeout }), [clearTimeout, setTimeout]);

  return <HeadlessCarouselComposer ponyfill={ponyfill}>{children}</HeadlessCarouselComposer>;
}

CarouselComposer.displayName = 'CarouselComposer';

export default memo(CarouselComposer);
export { carouselComposerPropsSchema, type CarouselComposerProps };
