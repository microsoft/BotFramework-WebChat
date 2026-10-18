import { useMemo, useRef } from 'react';

import addEventListenerWithUndo from '../../DOMManipulationWithUndo/addEventListenerWithUndo';
import bunchUndos from '../../DOMManipulationWithUndo/bunchUndos';
import durableAddClassWithUndo from '../../DOMManipulationWithUndo/durableAddClassWithUndo';
import setOrRemoveAttributeIfFalseWithUndo from '../../DOMManipulationWithUndo/setOrRemoveAttributeIfFalseWithUndo';
import closest from './private/closest';
import findDOMNodeOwner from './private/findDOMNodeOwner';
import useAdaptiveCardModEffect from './private/useAdaptiveCardModEffect';
import usePrevious from './private/usePrevious';

import type { AdaptiveCard, CardObject } from 'adaptivecards';
import type { UndoFunction } from '../../DOMManipulationWithUndo/types/UndoFunction';

/**
 * Accessibility: Action in ActionSet/CardElement should be push button, i.e. a plain command button.
 *
 * Pressing the action button is a decision-making process. The decision made by the end-user need to be read by the screen reader.
 * Thus, we need to indicate what decision the end-user made.
 *
 * Action buttons are not toggle buttons: pressing a selected action again does not unselect it.
 * Thus, instead of `aria-pressed`, the selected action is described by the element of `descriptionId` (e.g. "Selected"),
 * and styled by `selectedClassName`.
 *
 * One exception is the `Action.ShowCard` action. This button represents expand/collapse header of an accordion.
 * Thus, their state is indicated by `aria-expanded` and they are never selected.
 * However, we still need to remove other unnecessary ARIA fields.
 */
export default function useActionShouldBePushButtonModEffect(
  adaptiveCard: AdaptiveCard
): readonly [(cardElement: HTMLElement, selectedClassName: string, descriptionId: string) => void, () => void] {
  const prevAdaptiveCard = usePrevious(adaptiveCard);
  const pushedCardObjectsRef = useRef<Set<CardObject>>(new Set());

  prevAdaptiveCard === adaptiveCard || pushedCardObjectsRef.current.clear();

  const modder = useMemo(
    () => (adaptiveCard: AdaptiveCard, cardElement: HTMLElement, selectedClassName: string, descriptionId: string) => {
      const undoStack: UndoFunction[] = [];

      const markAsSelected = (actionElement: HTMLElement) =>
        undoStack.push(
          durableAddClassWithUndo(actionElement, selectedClassName),
          setOrRemoveAttributeIfFalseWithUndo(actionElement, 'aria-describedby', descriptionId)
        );

      Array.from(cardElement.querySelectorAll('button.ac-pushButton') as NodeListOf<HTMLButtonElement>).forEach(
        actionElement => {
          const cardObject = findDOMNodeOwner(adaptiveCard, actionElement);

          !actionElement.hasAttribute('aria-expanded') &&
            pushedCardObjectsRef.current.has(cardObject) &&
            markAsSelected(actionElement);

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

            markAsSelected(actionElement);

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
