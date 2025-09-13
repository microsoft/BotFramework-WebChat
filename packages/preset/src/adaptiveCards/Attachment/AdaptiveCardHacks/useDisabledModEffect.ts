import { useMemo } from 'react';

import bunchUndos from '../../DOMManipulationWithUndo/bunchUndos';
import durableDisableInputElementAccessiblyWithUndo from '../../DOMManipulationWithUndo/durableDisableInputElementAccessiblyWithUndo';
import useAdaptiveCardModEffect from './private/useAdaptiveCardModEffect';

import type { AdaptiveCard } from 'adaptivecards';
import type { UndoFunction } from '../../DOMManipulationWithUndo/types/UndoFunction';

// This is intended. This is a no-op function and intended to do nothing.
// eslint-disable-next-line @typescript-eslint/no-empty-function
const NO_OP: UndoFunction = () => {};

// In Adaptive Cards, <button> with "aria-expanded" attribute means it is makeshift of <details> and it is Action.ShowCard.
// In HTML, <details> should not be disabled unless the accordion does not permit the panel to be collapsed.
// So when we look for input elements, should skip <button> that mimick <details>.
const INPUT_ELEMENT_SELECTOR = 'button:not([aria-expanded]), input, select, textarea';
type InputElementType = HTMLButtonElement | HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

/**
 * Accessibility: Form fields in Adaptive Cards need to be disabled to reduce confusion for screen reader users.
 *
 * One exception is the `Action.ShowUrl`, this is because this action is expand/collapse of an accordion control.
 * Similar to `<details>`/`<summary>`, accordion must not allowed to be disabled.
 */
export default function useDisabledModEffect(
  adaptiveCard: AdaptiveCard
): readonly [(cardElement: HTMLElement, disabled: boolean) => void, () => void] {
  const modder = useMemo(
    () => (_, cardElement: HTMLElement, disabled: boolean) => {
      if (!disabled) {
        return NO_OP;
      }

      const undoStack: (() => void)[] = Array.from(
        cardElement.querySelectorAll(INPUT_ELEMENT_SELECTOR) as NodeListOf<InputElementType>
      ).map(element => durableDisableInputElementAccessiblyWithUndo(element));

      return () => bunchUndos(undoStack)();
    },
    []
  );

  return useAdaptiveCardModEffect(modder, adaptiveCard);
}
