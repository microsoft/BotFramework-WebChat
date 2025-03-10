import { useMemo } from 'react';

import setOrRemoveAttributeIfFalseWithUndo from '../../DOMManipulationWithUndo/setOrRemoveAttributeIfFalseWithUndo';
import useAdaptiveCardModEffect from './private/useAdaptiveCardModEffect';

import type { AdaptiveCard } from 'adaptivecards';

/**
 * Accessibility: "role" attribute must be set if "aria-label" is set.
 *
 * It is possible to render an Adaptive Card with empty content but "aria-label" attribute. The Adaptive Cards JSON looks like:
 *
 * ```json
 * {
 *   "type": "AdaptiveCard",
 *   "speak": "Hello, World!",
 *   "body": [],
 *   "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
 *   "version": "1.5"
 * }
 * ```
 *
 * The HTML output will be:
 *
 * ```html
 * <div class="ac-adaptiveCard" aria-label="Hello, World!"></div>
 * ```
 *
 * This violates WAI-ARIA because "aria-label" must not be set on an element without a "role".
 *
 * We need to set "role" attribute to "form" if the card has any input fields and is valid as a "form" role, otherwise, "figure".
 */
export default function useRoleModEffect(
  adaptiveCard: AdaptiveCard
): readonly [(cardElement: HTMLElement) => void, () => void] {
  const modder = useMemo(
    () => (_, cardElement: HTMLElement) =>
      setOrRemoveAttributeIfFalseWithUndo(
        cardElement,
        'role',
        // "form" role requires either "aria-label", "aria-labelledby", or "title".
        (cardElement.querySelector('button, input, select, textarea') && cardElement.getAttribute('aria-label')) ||
          cardElement.getAttribute('aria-labelledby') ||
          cardElement.getAttribute('title')
          ? 'form'
          : 'figure'
      ),
    []
  );

  return useAdaptiveCardModEffect(modder, adaptiveCard);
}
