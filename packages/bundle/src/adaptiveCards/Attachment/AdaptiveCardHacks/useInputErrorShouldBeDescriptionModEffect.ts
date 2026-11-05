import { useMemo } from 'react';

import bunchUndos from '../../DOMManipulationWithUndo/bunchUndos';
import setOrRemoveAttributeIfFalseWithUndoIfUnchanged from '../../DOMManipulationWithUndo/setOrRemoveAttributeIfFalseWithUndoIfUnchanged';
import useAdaptiveCardModEffect from './private/useAdaptiveCardModEffect';

import type { AdaptiveCard } from 'adaptivecards';
import type { UndoFunction } from '../../DOMManipulationWithUndo/types/UndoFunction';

const FORM_CONTROL_SELECTOR = 'input, select, textarea';

function splitIds(value: string | null): readonly string[] {
  return (value || '').split(/\s+/u).filter(Boolean);
}

// TODO: [P2] Remove this mod when Adaptive Cards references the error message from "aria-describedby" instead of "aria-labelledby".
//            Currently, `Input.getAllLabelIds()` returns the ID of the error message. When fixed, this mod does nothing.
/**
 * Accessibility: validation error message of an input should be its description, not part of its name.
 *
 * When validation fails, Adaptive Cards appends the error message right after the input container,
 * and adds its ID to "aria-labelledby" of the input, i.e. screen readers read the error message as part of the label.
 * When the error is cleared, Adaptive Cards keeps the ID in "aria-labelledby", pointing to an element which no longer exists.
 *
 * We need to move the ID of the error message to "aria-describedby", set `aria-invalid="true"`, and remove IDs that point to nothing.
 *
 * When Adaptive Cards puts "aria-labelledby" on a wrapper (filtered `Input.ChoiceSet`), the form controls inside the wrapper are described.
 *
 * Adaptive Cards rewrites "aria-labelledby" on every validation without re-rendering,
 * so undo restores an attribute only if it still has our value, otherwise it would bring back a stale error ID.
 */
export default function useInputErrorShouldBeDescriptionModEffect(
  adaptiveCard: AdaptiveCard
): readonly [(cardElement: HTMLElement) => void, () => void] {
  const modder = useMemo(
    () => (_: AdaptiveCard, cardElement: HTMLElement) => {
      const rootNode = cardElement.getRootNode();
      // Only a document or a shadow root can look up IDs, a detached card has neither.
      const isDangling = (id: string) =>
        (rootNode instanceof Document || rootNode instanceof ShadowRoot) && !rootNode.getElementById(id);
      const undoStack: UndoFunction[] = [];

      cardElement.querySelectorAll('.ac-input-container').forEach(containerElement => {
        // The error message is the element after the input container, only while it is shown.
        const errorId = containerElement.nextElementSibling?.id;

        containerElement.querySelectorAll<HTMLElement>('[aria-labelledby]').forEach(labelledElement => {
          const labelIds = splitIds(labelledElement.getAttribute('aria-labelledby'));

          undoStack.push(
            setOrRemoveAttributeIfFalseWithUndoIfUnchanged(
              labelledElement,
              'aria-labelledby',
              labelIds.filter(id => id !== errorId && !isDangling(id)).join(' ') || false
            )
          );

          if (errorId && labelIds.includes(errorId)) {
            (labelledElement.matches(FORM_CONTROL_SELECTOR)
              ? [labelledElement]
              : Array.from(labelledElement.querySelectorAll<HTMLElement>(FORM_CONTROL_SELECTOR))
            ).forEach(controlElement => {
              const describedByIds = splitIds(controlElement.getAttribute('aria-describedby'));

              undoStack.push(
                setOrRemoveAttributeIfFalseWithUndoIfUnchanged(
                  controlElement,
                  'aria-describedby',
                  (describedByIds.includes(errorId) ? describedByIds : [...describedByIds, errorId]).join(' ')
                ),
                setOrRemoveAttributeIfFalseWithUndoIfUnchanged(controlElement, 'aria-invalid', 'true')
              );
            });
          }
        });
      });

      return bunchUndos(undoStack);
    },
    []
  );

  return useAdaptiveCardModEffect(modder, adaptiveCard);
}
