import { useMemo } from 'react';

import bunchUndos from '../../DOMManipulationWithUndo/bunchUndos';
import durableDisableInputElementAccessiblyWithUndo from '../../DOMManipulationWithUndo/durableDisableInputElementAccessiblyWithUndo';
import useAdaptiveCardModEffect from './useAdaptiveCardModEffect';

import type { AdaptiveCard } from 'adaptivecards';
import type { UndoFunction } from '../../DOMManipulationWithUndo/types/UndoFunction';

// This is intended. This is a no-op function and intended to do nothing.
// eslint-disable-next-line @typescript-eslint/no-empty-function
const NO_OP: UndoFunction = () => {};

// <button> with "aria-expanded" attribute means it is makeshift of <details>. In Adaptive Cards term, it is Action.ShowCard.
// In HTML, <details> cannot be disabled. So we are skipping <button> that mimick <details>.
// From APG for Accordion:
//   If the accordion panel associated with an accordion header is visible, and if the accordion does not permit the panel to be collapsed, the header button element has aria-disabled set to true.
// TODO: [P*] Add test.
const INPUT_ELEMENT_SELECTOR = 'button:not([aria-expanded]), input, select, textarea';
type InputElementType = HTMLButtonElement | HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

/**
 * When "disabled" attribute is set, inputtable content in the Adaptive Card should be disabled.
 *
 * One exception is the `Action.ShowUrl`, this is because this action is expand/collapse of an accordion control.
 * Similar to `<details>`/`<summary>`, accordion must not allowed to be disabled.
 */
export default function useDisabledModEffect(adaptiveCard: AdaptiveCard, disabled: boolean) {
  const modder = useMemo(
    () => (_, cardElement: HTMLElement) => {
      if (!disabled) {
        return NO_OP;
      }

      const undoStack: (() => void)[] = Array.from(
        cardElement.querySelectorAll(INPUT_ELEMENT_SELECTOR) as NodeListOf<InputElementType>
      ).reduce(
        (undoStack, element) => [...undoStack, durableDisableInputElementAccessiblyWithUndo(element)],
        [] as UndoFunction[]
      );

      return () => bunchUndos(undoStack)();
    },
    [disabled]
  );

  return useAdaptiveCardModEffect(modder, adaptiveCard);
}
