import { useMemo, useRef } from 'react';

import addEventListenerWithUndo from '../../DOMManipulationWithUndo/addEventListenerWithUndo';
import bunchUndos from '../../DOMManipulationWithUndo/bunchUndos';
import closest from './private/closest';
import durableAddClassWithUndo from '../../DOMManipulationWithUndo/durableAddClassWithUndo';
import findDOMNodeOwner from './private/findDOMNodeOwner';
import setOrRemoveAttributeIfFalseWithUndo from '../../DOMManipulationWithUndo/setOrRemoveAttributeIfFalseWithUndo';
import useAdaptiveCardModEffect from './private/useAdaptiveCardModEffect';
import usePrevious from './private/usePrevious';

import type { AdaptiveCard, CardObject } from 'adaptivecards';
import type { UndoFunction } from '../../DOMManipulationWithUndo/types/UndoFunction';

/**
 * Accessibility: Action in ActionSet/CardElement should be push button.
 *
 * Pressing the action button is a decision-making process. The decision made by the end-user need to be read by the screen reader.
 * Thus, we need to indicate what decision the end-user made.
 *
 * Since action buttons are button, the intuitive way to indicate selection of a button is marking it as pressed.
 *
 * One exception is the `Action.ShowUrl` action. This button represents expand/collapse header of an accordion.
 * Thus, their state is indicated by `aria-expanded`, instead of `aria-pressed`.
 * However, we still need to remove other unnecessary ARIA fields.
 */
export default function useActionShouldBePushButtonModEffect(
  adaptiveCard: AdaptiveCard
): readonly [(cardElement: HTMLElement, actionPerformedClassName?: string) => void, () => void] {
  const prevAdaptiveCard = usePrevious(adaptiveCard);
  const pushedCardObjectsRef = useRef<Set<CardObject>>(new Set());

  prevAdaptiveCard === adaptiveCard || pushedCardObjectsRef.current.clear();

  const modder = useMemo(
    () => (adaptiveCard: AdaptiveCard, cardElement: HTMLElement, actionPerformedClassName?: string) => {
      const undoStack: UndoFunction[] = [];

      Array.from(cardElement.querySelectorAll('button.ac-pushButton') as NodeListOf<HTMLButtonElement>).forEach(
        actionElement => {
          const cardObject = findDOMNodeOwner(adaptiveCard, actionElement);

          if (!actionElement.hasAttribute('aria-expanded')) {
            if (pushedCardObjectsRef.current.has(cardObject)) {
              actionPerformedClassName &&
                undoStack.push(durableAddClassWithUndo(actionElement, actionPerformedClassName));

              undoStack.push(setOrRemoveAttributeIfFalseWithUndo(actionElement, 'aria-pressed', 'true'));
            } else {
              undoStack.push(setOrRemoveAttributeIfFalseWithUndo(actionElement, 'aria-pressed', 'false'));
            }
          }

          undoStack.push(
            setOrRemoveAttributeIfFalseWithUndo(actionElement, 'aria-posinset', false),
            setOrRemoveAttributeIfFalseWithUndo(actionElement, 'aria-setsize', false),
            setOrRemoveAttributeIfFalseWithUndo(actionElement, 'role', false)
          );
        }
      );

      undoStack.push(
        addEventListenerWithUndo(
          cardElement,
          'click',
          ({ target }) => {
            // Depends on click location, `target` could be the <div> inside the <button class="ac-pushButton">.
            // Thus, we need to check if we the `target` is inside `button.ac-pushButton` or not.
            const actionElement = closest(target as HTMLButtonElement, 'button.ac-pushButton');

            if (!actionElement) {
              return;
            }

            const cardObject = findDOMNodeOwner(adaptiveCard, actionElement);

            if (
              // Not an AC action.
              !cardObject ||
              // Ignores buttons which are supposed to be disabled.
              actionElement.getAttribute('aria-disabled') === 'true' ||
              // Mods all AC action buttons except those for `Action.ShowCard`, which has `aria-expanded` attribute.
              actionElement.hasAttribute('aria-expanded')
            ) {
              return;
            }

            actionPerformedClassName &&
              undoStack.push(durableAddClassWithUndo(actionElement, actionPerformedClassName));

            undoStack.push(setOrRemoveAttributeIfFalseWithUndo(actionElement, 'aria-pressed', 'true'));

            cardObject && pushedCardObjectsRef.current.add(cardObject);
          },
          { capture: true }
        )
      );

      return () => bunchUndos(undoStack)();
    },
    [pushedCardObjectsRef]
  );

  return useAdaptiveCardModEffect(modder, adaptiveCard);
}
