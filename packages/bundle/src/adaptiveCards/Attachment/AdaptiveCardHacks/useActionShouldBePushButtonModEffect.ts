import { useCallback, useMemo, useRef } from 'react';

import bunchUndos from '../../DOMManipulationWithUndo/bunchUndos';
import durableAddClassWithUndo from '../../DOMManipulationWithUndo/durableAddClassWithUndo';
import setOrRemoveAttributeIfFalseWithUndo from '../../DOMManipulationWithUndo/setOrRemoveAttributeIfFalseWithUndo';
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
 * An action is selected only after Adaptive Cards executed it, i.e. `markActionAsSelected()` is called from `onExecuteAction`.
 * Adaptive Cards does not execute an action when its inputs fail validation, e.g. a required input is empty.
 *
 * One exception is the `Action.ShowCard` action. This button represents expand/collapse header of an accordion.
 * Thus, their state is indicated by `aria-expanded` and they are never selected.
 * However, we still need to remove other unnecessary ARIA fields.
 */
export default function useActionShouldBePushButtonModEffect(
  adaptiveCard: AdaptiveCard
): readonly [
  (cardElement: HTMLElement, selectedClassName: string, descriptionId: string) => void,
  () => void,
  (action: CardObject) => void
] {
  const markActionAsSelectedRef = useRef<((action: CardObject) => void) | undefined>();
  const prevAdaptiveCard = usePrevious(adaptiveCard);
  const pushedCardObjectsRef = useRef<Set<CardObject>>(new Set());

  prevAdaptiveCard === adaptiveCard || pushedCardObjectsRef.current.clear();

  const modder = useMemo(
    () => (adaptiveCard: AdaptiveCard, cardElement: HTMLElement, selectedClassName: string, descriptionId: string) => {
      const actionElements = Array.from(
        cardElement.querySelectorAll('button.ac-pushButton') as NodeListOf<HTMLButtonElement>
      );
      const undoStack: UndoFunction[] = [];

      const markAsSelected = (actionElement: HTMLElement) =>
        // Mods all AC action buttons except those for `Action.ShowCard`, which has `aria-expanded` attribute.
        !actionElement.hasAttribute('aria-expanded') &&
        undoStack.push(
          durableAddClassWithUndo(actionElement, selectedClassName),
          setOrRemoveAttributeIfFalseWithUndo(actionElement, 'aria-describedby', descriptionId)
        );

      actionElements.forEach(actionElement => {
        pushedCardObjectsRef.current.has(findDOMNodeOwner(adaptiveCard, actionElement)) &&
          markAsSelected(actionElement);

        undoStack.push(
          setOrRemoveAttributeIfFalseWithUndo(actionElement, 'aria-posinset', false),
          setOrRemoveAttributeIfFalseWithUndo(actionElement, 'aria-setsize', false),
          setOrRemoveAttributeIfFalseWithUndo(actionElement, 'role', false)
        );
      });

      markActionAsSelectedRef.current = ({ renderedElement }: CardObject) =>
        actionElements.filter(actionElement => actionElement === renderedElement).forEach(markAsSelected);

      return () => {
        markActionAsSelectedRef.current = undefined;

        bunchUndos(undoStack)();
      };
    },
    [markActionAsSelectedRef, pushedCardObjectsRef]
  );

  const [applyMod, undoMod] = useAdaptiveCardModEffect(modder, adaptiveCard);

  const markActionAsSelected = useCallback(
    (action: CardObject) => {
      pushedCardObjectsRef.current.add(action);
      markActionAsSelectedRef.current?.(action);
    },
    [markActionAsSelectedRef, pushedCardObjectsRef]
  );

  return useMemo(
    () => Object.freeze([applyMod, undoMod, markActionAsSelected] as const),
    [applyMod, markActionAsSelected, undoMod]
  );
}
