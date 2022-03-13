/* eslint no-magic-numbers: ["error", { "ignore": [-1, 0, 2] }] */

import {
  Action as AdaptiveCardAction,
  AdaptiveCard,
  IMarkdownProcessingResult,
  OpenUrlAction,
  SubmitAction
} from 'adaptivecards';
import { Components, getTabIndex, hooks } from 'botframework-webchat-component';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {
  KeyboardEventHandler,
  MouseEventHandler,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  VFC
} from 'react';
import type { DirectLineCardAction } from 'botframework-webchat-core';

import { BotFrameworkCardAction } from './AdaptiveCardBuilder';
import useAdaptiveCardsHostConfig from '../hooks/useAdaptiveCardsHostConfig';
import useAdaptiveCardsPackage from '../hooks/useAdaptiveCardsPackage';

const { ErrorBox } = Components;
const { useDisabled, useLocalizer, usePerformCardAction, useRenderMarkdownAsHTML, useScrollToEnd, useStyleSet } = hooks;

const node_env = process.env.node_env || process.env.NODE_ENV;

type UndoFunction = (() => void) | undefined;

function bunchUndos(...fns: UndoFunction[]): UndoFunction {
  return () => fns.forEach(fn => fn?.());
}

/**
 * Adds a class to the `HTMLElement`. Returns `true` if the class is added, otherwise, `undefined`.
 */
function addClass(element: HTMLElement, className: string): true | undefined {
  const { classList } = element;

  if (!classList.contains(className)) {
    classList.add(className);

    return true;
  }
}

/**
 * Adds a class to the `HTMLElement` and re-add on mutations.
 *
 * @returns {function} A function, when called, will restore to previous state.
 */
function addPersistentClassWithUndo(element: HTMLElement | undefined, className: string): UndoFunction {
  if (!element) {
    return;
  }

  if (addClass(element, className)) {
    // After we add the class, keep observing the element to make sure the class is not removed.
    const observer = new MutationObserver(() => addClass(element, className));

    observer.observe(element, { attributes: true, attributeFilter: ['class'] });

    return () => {
      const classNames = new Set(element.className.split(' '));

      classNames.delete(className);

      element.className = Array.from(classNames).join(' ');
      observer.disconnect();
    };
  }
}

/**
 * Returns `true`, if the object is a plain object and not a class, otherwise, `false`.
 */
function isPlainObject(obj) {
  return Object.getPrototypeOf(obj) === Object.prototype;
}

/**
 * Sets an attribute.
 *
 * @returns {function} A function, when called, will restore to previous state.
 */
function setAttributeWithUndo(
  element: HTMLElement | undefined,
  qualifiedName: string,
  nextValue: string
): UndoFunction {
  if (!element) {
    return;
  }

  const value = element.getAttribute(qualifiedName);

  if (value !== nextValue) {
    element.setAttribute(qualifiedName, nextValue);

    return () => (value ? element.setAttribute(qualifiedName, value) : element.removeAttribute(qualifiedName));
  }
}

/**
 * An event handler for disabling event bubbling and propagation.
 */
const disabledHandler = (event: Event) => {
  event.preventDefault();
  event.stopImmediatePropagation();
  event.stopPropagation();
};

/**
 * Listens to event once. Returns a function, when called, will stop listening.
 */
function addEventListenerOnceWithUndo(
  element: HTMLElement | undefined,
  name: string,
  handler: EventListener
): UndoFunction {
  if (!element) {
    return;
  }

  /* eslint-disable-next-line prefer-const */
  let detach: () => void;
  const detachingHandler = event => {
    try {
      handler(event);
    } finally {
      // IE11 does not support { once: true }, so we need to detach manually.
      detach();
    }
  };

  detach = () => element.removeEventListener(name, detachingHandler);

  element.addEventListener(name, detachingHandler, { once: true });

  return detach;
}

/**
 * Listens to event. Returns a function, when called, will stop listening.
 */
function addEventListenerWithUndo(
  element: HTMLElement | undefined,
  name: string,
  handler: EventListener
): UndoFunction {
  if (!element) {
    return;
  }

  element.addEventListener(name, handler);

  return () => element.removeEventListener(name, handler);
}

/**
 * Disables an element with undo function.
 *
 * @returns {function} A function, when called, will restore to previous state.
 */
function disableElementWithUndo(element: HTMLElement | undefined): UndoFunction {
  if (!element) {
    return;
  }

  const undoStack: UndoFunction[] = [];
  const isActive = element === document.activeElement;
  const tag = element.nodeName.toLowerCase();

  /* eslint-disable-next-line default-case */
  switch (tag) {
    case 'button':
    case 'input':
    case 'select':
    case 'textarea':
      undoStack.push(setAttributeWithUndo(element, 'aria-disabled', 'true'));

      if (isActive) {
        undoStack.push(
          addEventListenerOnceWithUndo(element, 'blur', () =>
            undoStack.push(setAttributeWithUndo(element, 'disabled', 'disabled'))
          )
        );
      } else {
        undoStack.push(setAttributeWithUndo(element, 'disabled', 'disabled'));
      }

      if (tag === 'input' || tag === 'textarea') {
        undoStack.push(addEventListenerWithUndo(element, 'click', disabledHandler));
        undoStack.push(setAttributeWithUndo(element, 'readonly', 'readonly'));
      } else if (tag === 'select') {
        undoStack.push(
          ...[].map.call(element.querySelectorAll('option'), option =>
            setAttributeWithUndo(option, 'disabled', 'disabled')
          )
        );
      }

      break;
  }

  return bunchUndos(...undoStack);
}

/**
 * Disables all inputtable descendants.
 *
 * @param {HTMLElement | undefined} element Container element to start looking for inputtable descendants.
 * @param {boolean} observeSubtree `true` to applies to all future inputtable descendants, otherwise, `false`.
 *
 * @returns {function} A function, when called, will restore to previous state.
 */
function disableInputElementsWithUndo(element: HTMLElement | undefined, observeSubtree = true): UndoFunction {
  if (!element) {
    return;
  }

  const undoStack: (() => void)[] = [].map.call(element.querySelectorAll('button, input, select, textarea'), element =>
    disableElementWithUndo(element)
  );

  const tag = element.nodeName.toLowerCase();

  // Only set tabindex="-1" on focusable element. Otherwise, we will make <div> focusable by mouse.
  (tag === 'a' || tag === 'button' || tag === 'input' || tag === 'select' || tag === 'textarea') &&
    undoStack.push(setAttributeWithUndo(element, 'tabindex', '-1'));

  if (observeSubtree) {
    const observer = new MutationObserver(mutations =>
      mutations.forEach(({ addedNodes }) =>
        undoStack.push(...[].map.call(addedNodes, addedNode => disableInputElementsWithUndo(addedNode, false)))
      )
    );

    observer.observe(element, { childList: true, subtree: true });

    undoStack.push(() => observer.disconnect());
  }

  return bunchUndos(...undoStack);
}

/**
 * Gets the value of an attribute from an element.
 *
 * @returns {false | string} The value of the attribute. `false` if the attribute was not set.
 */
function getAttribute(element: HTMLElement, qualifiedName: string): false | string {
  return !!element && element.hasAttribute(qualifiedName) && (element.getAttribute(qualifiedName) || '');
}

/**
 * Sets or removes an attribute from an element.
 *
 * @param {HTMLElement} element - The element to set or remove attribute from.
 * @param {string} qualifiedName - The name of the attribute.
 * @param {false | string} value - The value of the attribute. When passing `false`, remove the attribute.
 */
function setOrRemoveAttribute(element: HTMLElement | undefined, qualifiedName: string, value: false | string): void {
  if (value === false) {
    element?.removeAttribute(qualifiedName);
  } else {
    element?.setAttribute(qualifiedName, value);
  }
}

/**
 * Sets or removes an attribute from an element with an undo function.
 *
 * @param {HTMLElement} element - The element to set or remove attribute from.
 * @param {string} qualifiedName - The name of the attribute.
 * @param {false | string} value - The value of the attribute. When passing `false`, remove the attribute.
 *
 * @returns {() => void} The undo function, when called, will undo all manipulations by restoring values recorded at the time of the function call.
 */
function setOrRemoveAttributeWithUndo(
  element: HTMLElement | undefined,
  qualifiedName: string,
  value: false | string
): UndoFunction {
  if (!element) {
    return;
  }

  const prevValue = getAttribute(element, qualifiedName);

  setOrRemoveAttribute(element, qualifiedName, value);

  return () => setOrRemoveAttribute(element, qualifiedName, prevValue);
}

/**
 * Finds the first ancestor that fulfill the predicate.
 *
 * @param {HTMLElement} element - The starting element. This element will not be checked against the predicate.
 * @param {(ancestor: HTMLElement) => boolean} predicate - The predicate to fulfill.
 *
 * @returns {HTMLElement | undefined} The first ancestor that fulfill the predicate, otherwise, `undefined`.
 */
function findAncestor(element: HTMLElement, predicate: (ancestor: HTMLElement) => boolean): HTMLElement | undefined {
  let current = element;

  while ((current = current.parentElement)) {
    if (predicate.call(element, current)) {
      return current;
    }
  }
}

/**
 * Indicates the action selected by performing a series of manipulations, with undo:
 *
 * - Accessibility: set `aria-pressed` to `true`
 * - Applies `styleOptions.actionPerformedClassName`
 *
 * @param {HTMLElement[]} selectedActionElements - An array of elements that are representing the action and is selected.
 * @param {string?} actionPerformedClassName - The name of the class to apply to all elements.
 *
 * @returns {() => void} The undo function, when called, will undo all manipulations by restoring values recorded at the time of the function call.
 */
function indicateActionSelectionWithUndo(
  selectedActionElements: HTMLElement[] | undefined,
  actionPerformedClassName?: string
): UndoFunction {
  if (!selectedActionElements?.length) {
    return;
  }

  // Verify all input elements are "ac-pushButton", could belongs to ActionSet or "card actions".
  if (selectedActionElements.some(actionElement => !actionElement.classList.contains('ac-pushButton'))) {
    console.warn(
      'botframework-webchat: Cannot mark selected action in the card, some elements are not an "ac-pushButton".'
    );

    return;
  }

  // A distinct set of action set containers which has selections, excluding containers without actions.
  // Multiple submission in an Adaptive Card is still a vague area and TBD.
  // We might want to disable the whole card, just buttons in same container, or do nothing (today).
  const actionSetElements = new Set<HTMLElement>();

  selectedActionElements.forEach(selectedActionElement => {
    const actionSetElement = findAncestor(
      selectedActionElement,
      ancestor => ancestor.getAttribute('role') === 'menubar'
    );

    actionSetElement && actionSetElements.add(actionSetElement);
  });

  const undoStack: (() => void)[] = [];

  actionSetElements.forEach(actionSetElement => {
    // Remove "role" from every "ac-actionSet" container.
    undoStack.push(setOrRemoveAttributeWithUndo(actionSetElement, 'role', false));

    // Modify "role" of every actions in the container.
    Array.from(actionSetElement.querySelectorAll('.ac-pushButton') as NodeListOf<HTMLElement>).forEach(
      actionElement => {
        if (selectedActionElements.includes(actionElement)) {
          // Add "aria-pressed" and set "role" attribute to "button" (which is required by "aria-pressed").
          undoStack.push(setOrRemoveAttributeWithUndo(actionElement, 'aria-pressed', 'true'));
          undoStack.push(setOrRemoveAttributeWithUndo(actionElement, 'role', 'button'));

          // Highlight actions by applying `styleOptions.actionPerformedClassName`.
          actionPerformedClassName &&
            undoStack.push(addPersistentClassWithUndo(actionElement, actionPerformedClassName));
        } else {
          // We removed "role=menubar" from the container, we must remove "role=menuitem" from unselected actions.
          undoStack.push(setOrRemoveAttributeWithUndo(actionElement, 'role', false));
        }
      }
    );
  });

  return bunchUndos(...undoStack);
}

/**
 * Fixes accessibility issues from Adaptive Card, with undo.
 *
 * @returns {() => void} The undo function, when called, will undo all manipulations by restoring values recorded at the time of the function call.
 */
function fixAccessibilityIssuesWithUndo(element: HTMLElement): UndoFunction {
  if (!element) {
    return;
  }

  // These hacks should be done in Adaptive Cards library instead.
  // Related to #3949: All action buttons inside role="menubar" should be role="menuitem".
  const undoStack: UndoFunction[] = Array.from(
    element.querySelectorAll('.ac-actionSet[role="menubar"] [role="button"]') as NodeListOf<HTMLElement>
  ).map(actionButton => setAttributeWithUndo(actionButton, 'role', 'menuitem'));

  return () => undoStack.forEach(undo => undo?.());
}

function getFocusableElements(element: HTMLElement) {
  return [].filter.call(
    element.querySelectorAll(
      [
        'a',
        'body',
        'button',
        'frame',
        'iframe',
        'img',
        'input',
        'isindex',
        'object',
        'select',
        'textarea',
        '[tabindex]'
      ].join(', ')
    ) as NodeListOf<HTMLElement>,
    element => {
      const tabIndex = getTabIndex(element);

      return typeof tabIndex === 'number' && tabIndex >= 0;
    }
  );
}

function restoreActiveElementIndex(element: HTMLElement, activeElementIndex: number) {
  getFocusableElements(element)[+activeElementIndex]?.focus();
}

function saveActiveElementIndex(element: HTMLElement) {
  return getFocusableElements(element).indexOf(document.activeElement);
}

function restoreInputValues(element: HTMLElement, inputValues: (boolean | string)[]) {
  const inputs = element.querySelectorAll('input, select, textarea') as NodeListOf<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >;

  [].forEach.call(inputs, (input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, index: number) => {
    const value = inputValues[+index];

    if (typeof value !== 'undefined') {
      const { tagName, type } = input;

      if (tagName === 'INPUT' && (type === 'checkbox' || type === 'radio')) {
        if (typeof value === 'boolean') {
          (input as HTMLInputElement).checked = value;
        }
      } else if (typeof value === 'string') {
        input.value = value;
      }
    }
  });
}

function saveInputValues(element: HTMLElement): (boolean | string)[] {
  const inputs = element.querySelectorAll('input, select, textarea') as NodeListOf<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >;

  return [].map.call(inputs, (input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) => {
    const { type } = input;

    if (input.tagName === 'INPUT' && (type === 'checkbox' || type === 'radio')) {
      return (input as HTMLInputElement).checked;
    }

    return input.value;
  });
}

type AdaptiveCardRendererProps = {
  actionPerformedClassName?: string;
  adaptiveCard: AdaptiveCard;
  disabled?: boolean;
  tapAction?: DirectLineCardAction;
};

const AdaptiveCardRenderer: VFC<AdaptiveCardRendererProps> = ({
  actionPerformedClassName,
  adaptiveCard,
  disabled: disabledFromProps,
  tapAction
}) => {
  const [{ adaptiveCardRenderer: adaptiveCardRendererStyleSet }] = useStyleSet();
  const [{ GlobalSettings, HostConfig }] = useAdaptiveCardsPackage();
  const [actionsPerformed, setActionsPerformed] = useState<AdaptiveCardAction[]>([]);
  const [adaptiveCardsHostConfig] = useAdaptiveCardsHostConfig();
  const [disabledFromComposer] = useDisabled();
  const [errors, setErrors] = useState([]);
  const [lastRender, setLastRender] = useState(0);
  const activeElementIndexRef = useRef(-1);
  const adaptiveCardElementRef = useRef<HTMLElement>();
  const contentRef = useRef<HTMLDivElement>();
  const inputValuesRef = useRef<(boolean | string)[]>([]);
  const localize = useLocalizer();
  const performCardAction = usePerformCardAction();
  const renderMarkdownAsHTML = useRenderMarkdownAsHTML();
  const scrollToEnd = useScrollToEnd();

  const disabled = disabledFromComposer || disabledFromProps;

  // TODO: [P2] #3199 We should consider using `adaptiveCard.selectAction` instead.
  // The null check for "tapAction" is in "handleClickAndKeyPressForTapAction".
  const handleClickAndKeyPress = useCallback(
    (event: KeyboardEvent | MouseEvent): void => {
      const { key, type } = event as KeyboardEvent;
      const target = event.target as HTMLDivElement;

      // Some items, e.g. tappable text, cannot be disabled thru DOM attributes
      const { current } = contentRef;
      const adaptiveCardRoot = current.querySelector('.ac-adaptiveCard[tabindex="0"]');

      if (!adaptiveCardRoot) {
        return console.warn(
          'botframework-webchat: No Adaptive Card root container can be found; the card is probably on an unsupported Adaptive Card version.'
        );
      }

      // For "keypress" event, we only listen to ENTER and SPACEBAR key.
      if (type === 'keypress') {
        if (key !== 'Enter' && key !== ' ') {
          return;
        }

        event.preventDefault();
      }

      // We will call performCardAction if either:
      // 1. We are on the target, or
      // 2. The event-dispatching element is not interactive
      if (target !== adaptiveCardRoot) {
        const tabIndex = getTabIndex(target);

        // If the user is clicking on something that is already clickable, do not allow them to click the card.
        // E.g. a hero card can be tappable, and image and buttons inside the hero card can also be tappable.
        if (typeof tabIndex === 'number' && tabIndex >= 0) {
          return;
        }
      }

      performCardAction(tapAction);
      scrollToEnd();
    },
    [contentRef, performCardAction, scrollToEnd, tapAction]
  );

  // Only listen to event if it is not disabled and have "tapAction" prop.
  const handleClickAndKeyPressForTapAction = !disabled && tapAction ? handleClickAndKeyPress : undefined;

  const addActionsPerformed = useCallback(
    (action: AdaptiveCardAction): void =>
      !~actionsPerformed.indexOf(action) && setActionsPerformed([...actionsPerformed, action]),
    [actionsPerformed, setActionsPerformed]
  );

  const handleExecuteAction = useCallback(
    (action: AdaptiveCardAction): void => {
      // Some items, e.g. tappable image, cannot be disabled thru DOM attributes
      if (disabled) {
        return;
      }

      addActionsPerformed(action);

      const actionTypeName = action.getJsonTypeName();
      const { iconUrl: image, title } = action;

      // We cannot use "instanceof" check here, because web devs may bring their own version of Adaptive Cards package.
      // We need to check using "getJsonTypeName()" instead.
      if (actionTypeName === 'Action.OpenUrl') {
        const { url: value } = action as OpenUrlAction;

        performCardAction({
          image,
          title,
          type: 'openUrl',
          value
        });
      } else if (actionTypeName === 'Action.Submit') {
        const { data } = action as SubmitAction as {
          data: string | BotFrameworkCardAction;
        };

        if (typeof data !== 'undefined') {
          if (typeof data === 'string') {
            performCardAction({
              image,
              title,
              type: 'imBack',
              value: data
            });
          } else if (data.__isBotFrameworkCardAction) {
            performCardAction(data.cardAction);
          } else {
            performCardAction({
              image,
              title,
              type: 'postBack',
              value: data
            });
          }
        }

        scrollToEnd();
      } else {
        console.error(`Web Chat: received unknown action from Adaptive Cards`);
        console.error(action);
      }
    },
    [addActionsPerformed, disabled, performCardAction, scrollToEnd]
  );

  useLayoutEffect(() => {
    const { current } = contentRef;

    if (!current || !adaptiveCard) {
      activeElementIndexRef.current = -1;
      inputValuesRef.current = [];
    }

    // Currently, the only way to set the Markdown engine is to set it thru static member of AdaptiveCard class

    // TODO: [P3] Checks if we could make the "renderMarkdownAsHTML" per card
    //       This could be limitations from Adaptive Cards package (not supported as of 1.2.5)
    //       Because there could be timing difference between .parse and .render, we could be using wrong Markdown engine

    // "onProcessMarkdown" is a static function but we are trying to scope it to the current object instead.
    // eslint-disable-next-line dot-notation
    adaptiveCard.constructor['onProcessMarkdown'] = (text: string, result: IMarkdownProcessingResult) => {
      if (renderMarkdownAsHTML) {
        result.outputHtml = renderMarkdownAsHTML(text);
        result.didProcess = true;
      }
    };

    if (adaptiveCardsHostConfig) {
      adaptiveCard.hostConfig = isPlainObject(adaptiveCardsHostConfig)
        ? new HostConfig(adaptiveCardsHostConfig)
        : adaptiveCardsHostConfig;
    }

    // For accessibility issue #1340, `tabindex="0"` must not be set for the root container if it is not interactive.
    GlobalSettings.setTabIndexAtCardRoot = !!tapAction;

    const { validationEvents } = adaptiveCard.validateProperties();

    if (validationEvents.length) {
      return setErrors(validationEvents.reduce((items, { message }) => [...items, new Error(message)], []));
    }

    let element: HTMLElement;

    try {
      element = adaptiveCard.render();
    } catch (error) {
      return setErrors([error]);
    }

    if (!element) {
      return setErrors([new Error('Adaptive Card rendered as empty element')]);
    }

    // Clear errors on next render
    setErrors([]);

    restoreInputValues(element, inputValuesRef.current);

    current.appendChild(element);
    adaptiveCardElementRef.current = element;

    // Focus can only be restored after the DOM is attached.
    restoreActiveElementIndex(element, activeElementIndexRef.current);

    setLastRender(Date.now());

    return () => {
      activeElementIndexRef.current = saveActiveElementIndex(element);
      inputValuesRef.current = saveInputValues(element);

      current.removeChild(adaptiveCardElementRef.current);

      adaptiveCardElementRef.current = undefined;
    };
  }, [
    adaptiveCard,
    adaptiveCardsHostConfig,
    contentRef,
    GlobalSettings,
    HostConfig,
    renderMarkdownAsHTML,
    setErrors,
    tapAction
  ]);

  useEffect(() => {
    // Set onExecuteAction without causing unnecessary re-render.
    adaptiveCard.onExecuteAction = disabled ? undefined : handleExecuteAction;
  }, [adaptiveCard, disabled, handleExecuteAction]);

  useEffect(() => fixAccessibilityIssuesWithUndo(adaptiveCardElementRef.current), [adaptiveCardElementRef, lastRender]);

  useEffect(() => {
    // If the Adaptive Card get re-rendered, re-disable elements as needed.
    if (disabled) {
      return disableInputElementsWithUndo(adaptiveCardElementRef.current);
    }
  }, [adaptiveCardElementRef, disabled, lastRender]);

  useEffect(() => {
    // If the Adaptive Card changed, reset all actions performed.
    setActionsPerformed([]);
  }, [adaptiveCard]);

  useEffect(
    () =>
      indicateActionSelectionWithUndo(
        // Actions that do not have "renderedElement" means it is the Adaptive Card itself, such as "selectAction" (AC) or "tapAction" (rich cards).
        // We do not need to mark the whole card as performed.
        actionsPerformed.map(({ renderedElement }) => renderedElement).filter(renderedElement => renderedElement),
        actionPerformedClassName
      ),
    [actionsPerformed, actionPerformedClassName, lastRender]
  );

  return errors.length ? (
    node_env === 'development' && <ErrorBox error={errors[0]} type={localize('ADAPTIVE_CARD_ERROR_BOX_TITLE_RENDER')} />
  ) : (
    <div
      className={classNames(adaptiveCardRendererStyleSet + '', 'webchat__adaptive-card-renderer')}
      onClick={handleClickAndKeyPressForTapAction as unknown as MouseEventHandler<HTMLDivElement>}
      onKeyPress={handleClickAndKeyPressForTapAction as unknown as KeyboardEventHandler<HTMLDivElement>}
      ref={contentRef}
    />
  );
};

AdaptiveCardRenderer.defaultProps = {
  actionPerformedClassName: '',
  disabled: undefined,
  tapAction: undefined
};

AdaptiveCardRenderer.propTypes = {
  actionPerformedClassName: PropTypes.string,
  adaptiveCard: PropTypes.any.isRequired,
  disabled: PropTypes.bool,

  // TypeScript class is not mappable to PropTypes.func
  // @ts-ignore
  tapAction: PropTypes.shape({
    image: PropTypes.string,
    title: PropTypes.string,
    type: PropTypes.string.isRequired,
    value: PropTypes.string
  })
};

export default AdaptiveCardRenderer;
