import { useMemo } from 'react';
import { is, literal, object } from 'valibot';

import bunchUndos from '../../DOMManipulationWithUndo/bunchUndos';
import setOrRemoveAttributeIfFalseWithUndo from '../../DOMManipulationWithUndo/setOrRemoveAttributeIfFalseWithUndo';
import findDOMNodeOwner from './private/findDOMNodeOwner';
import useAdaptiveCardModEffect from './private/useAdaptiveCardModEffect';

import type { AdaptiveCard } from 'adaptivecards';

const emptyAltTextSchema = object({ altText: literal('') });

// TODO: [P2] Remove this mod when Adaptive Cards renders `alt=""` for `Image` with empty `altText`.
//            Currently, `Image.internalRender()` only sets the "alt" attribute when `altText` is truthy.
/**
 * Accessibility: Image with empty alternate text should be decorative.
 *
 * Bot marks an image as decorative by setting its alternate text to an empty string,
 * e.g. `altText: ""` in Adaptive Cards `Image`, or `alt: ""` in hero card image.
 *
 * Adaptive Cards only sets the "alt" attribute when the alternate text is not empty.
 * Without the "alt" attribute, the image is not decorative and screen readers may announce it.
 *
 * We need to set `alt=""` on these images.
 *
 * Image with select action is not decorative: Adaptive Cards renders it as a button or link,
 * named by the action title (`aria-label`). We must not set `alt=""` on it: it would not change its accessible name,
 * and axe reports `presentation-role-conflict` on focusable `<img alt="">` with ARIA attributes.
 */
export default function useImageAltTextModEffect(
  adaptiveCard: AdaptiveCard
): readonly [(cardElement: HTMLElement) => void, () => void] {
  const modder = useMemo(
    () => (adaptiveCard: AdaptiveCard, cardElement: HTMLElement) =>
      bunchUndos(
        Array.from(cardElement.querySelectorAll<HTMLImageElement>('img:not([role])'))
          .filter(imageElement => {
            const cardObject = findDOMNodeOwner(adaptiveCard, imageElement);

            // We cannot use "instanceof" check here, because web devs may bring their own version of Adaptive Cards package.
            return cardObject?.getJsonTypeName() === 'Image' && is(emptyAltTextSchema, cardObject);
          })
          .map(imageElement => setOrRemoveAttributeIfFalseWithUndo(imageElement, 'alt', ''))
      ),
    []
  );

  return useAdaptiveCardModEffect(modder, adaptiveCard);
}
