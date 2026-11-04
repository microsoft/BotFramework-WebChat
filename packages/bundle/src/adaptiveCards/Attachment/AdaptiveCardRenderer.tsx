/* eslint no-magic-numbers: ["error", { "ignore": [-1, 0, 2] }] */

import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { type Action as AdaptiveCardAction, type OpenUrlAction, type SubmitAction } from 'adaptivecards';
import { ErrorBoxPolymiddlewareProxy } from 'botframework-webchat-api/middleware.js';
import { getTabIndex, hooks } from 'botframework-webchat-component';
import { useQueueStaticElement, useStyles } from 'botframework-webchat-component/internal.js';
import { type DirectLineCardAction } from 'botframework-webchat-core';
import cx from 'classnames';
import React, {
  Fragment,
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type KeyboardEventHandler,
  type MouseEventHandler
} from 'react';
import { useRefFrom } from 'use-ref-from';
import { any, boolean, object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import useAdaptiveCardsHostConfig from '../hooks/useAdaptiveCardsHostConfig';
import useAdaptiveCardsPackage from '../hooks/useAdaptiveCardsPackage';
import useUniqueId from '../hooks/internal/useUniqueId';
import { BotFrameworkCardAction } from './AdaptiveCardBuilder';
import useValueRef from './AdaptiveCardHacks/private/useValueRef';
import useActionShouldBePushButtonModEffect from './AdaptiveCardHacks/useActionShouldBePushButtonModEffect';
import useActiveElementModEffect from './AdaptiveCardHacks/useActiveElementModEffect';
import useDisabledModEffect from './AdaptiveCardHacks/useDisabledModEffect';
import useImageAltTextModEffect from './AdaptiveCardHacks/useImageAltTextModEffect';
import usePersistValuesModEffect from './AdaptiveCardHacks/usePersistValuesModEffect';
import useRoleModEffect from './AdaptiveCardHacks/useRoleModEffect';
import { directLineHeadlessCardActionSchema } from './private/directLineCardActionSchema';
import renderAdaptiveCard from './private/renderAdaptiveCard';

import styles from './AdaptiveCardRenderer.module.css';

const { useLocalizer, usePerformCardAction, useRenderMarkdownAsHTML, useScrollToEnd, useUIState } = hooks;

const adaptiveCardRendererPropsSchema = pipe(
  object({
    actionPerformedClassName: optional(string()),
    adaptiveCard: any(),
    disabled: optional(boolean()),
    replyToId: optional(string()),
    tapAction: optional(directLineHeadlessCardActionSchema)
  }),
  readonly()
);

type AdaptiveCardRendererProps = InferInput<typeof adaptiveCardRendererPropsSchema>;

type AdaptiveCardRenderResult = {
  readonly element?: HTMLElement | undefined;
  readonly errors?: readonly Error[] | undefined;
};

function AdaptiveCardRenderer(props: AdaptiveCardRendererProps) {
  const {
    actionPerformedClassName,
    adaptiveCard,
    disabled: disabledFromProps,
    replyToId,
    tapAction
  } = validateProps(adaptiveCardRendererPropsSchema, props);

  const [{ GlobalSettings, HostConfig }] = useAdaptiveCardsPackage();
  const [adaptiveCardsHostConfig] = useAdaptiveCardsHostConfig();
  const [uiState] = useUIState();
  const contentRef = useRef<HTMLDivElement>(null);
  const localize = useLocalizer();
  const performCardAction = usePerformCardAction();
  const queueStaticElement = useQueueStaticElement();
  const renderMarkdownAsHTML = useRenderMarkdownAsHTML('adaptive cards');
  const scrollToEnd = useScrollToEnd();
  const selectedDescriptionId = useUniqueId('webchat__adaptive-card-renderer__selected-description');
  const classNames = useStyles(styles);

  const disabled = uiState === 'disabled' || disabledFromProps;
  const tapActionRef = useValueRef(tapAction);

  const disabledRef = useValueRef(disabled);

  // TODO: [P2] #3199 We should consider using `adaptiveCard.selectAction` instead.
  // The null check for "tapAction" is in "handleClickAndKeyPressForTapAction".
  const handleClickAndKeyPress = useCallback<KeyboardEventHandler<HTMLDivElement> | MouseEventHandler<HTMLDivElement>>(
    (event): void => {
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

      performCardAction(tapActionRef.current as DirectLineCardAction, undefined, { replyToId });
      scrollToEnd();
    },
    [contentRef, performCardAction, replyToId, scrollToEnd, tapActionRef]
  );

  // Only listen to event if it is not disabled and have "tapAction" prop.
  const handleClickAndKeyPressForTapAction = !disabled && tapAction ? handleClickAndKeyPress : undefined;

  const [applyActionShouldBePushButtonMod, undoActionShouldBePushButtonMod, markActionAsSelected] =
    useActionShouldBePushButtonModEffect(adaptiveCard);
  const [applyActiveElementMod, undoActiveElementMod] = useActiveElementModEffect(adaptiveCard);
  const [applyDisabledMod, undoDisabledMod] = useDisabledModEffect(adaptiveCard);
  const [applyImageAltTextMod, undoImageAltTextMod] = useImageAltTextModEffect(adaptiveCard);
  const [applyPersistValuesMod, undoPersistValuesMod] = usePersistValuesModEffect(adaptiveCard);
  const [applyRoleMod, undoRoleMod] = useRoleModEffect(adaptiveCard);

  const handleExecuteAction = useCallback(
    (action: AdaptiveCardAction): void => {
      // Some items, e.g. tappable image, cannot be disabled thru DOM attributes
      if (disabledRef.current) {
        return;
      }

      // Adaptive Cards calls `onExecuteAction` only after the inputs of the action passed validation.
      // Screen readers do not re-read the description of the focused button after it changed.
      // Thus, announce "Selected" via the live region.
      markActionAsSelected(action) && queueStaticElement(localize('ADAPTIVE_CARD_ACTION_SELECTED_ALT'));

      const actionTypeName = action.getJsonTypeName();
      const { iconUrl: image, title } = action;

      // We cannot use "instanceof" check here, because web devs may bring their own version of Adaptive Cards package.
      // We need to check using "getJsonTypeName()" instead.
      if (actionTypeName === 'Action.OpenUrl') {
        const { url: value } = action as OpenUrlAction;

        performCardAction(
          {
            image,
            title,
            type: 'openUrl',
            value
          },
          undefined,
          { replyToId }
        );
      } else if (actionTypeName === 'Action.OpenUrlDialog') {
        const { url: value } = action as OpenUrlAction;

        performCardAction(
          {
            image,
            title,
            type: 'webchat:callURL',
            value
          },
          undefined,
          { replyToId }
        );
      } else if (actionTypeName === 'Action.Submit') {
        const { data } = action as SubmitAction as {
          data: string | BotFrameworkCardAction;
        };

        if (typeof data !== 'undefined') {
          if (typeof data === 'string') {
            performCardAction(
              {
                image,
                title,
                type: 'imBack',
                value: data
              },
              undefined,
              { replyToId }
            );
          } else if (data.__isBotFrameworkCardAction) {
            performCardAction(data.cardAction, undefined, { replyToId });
          } else {
            performCardAction(
              {
                image,
                title,
                type: 'postBack',
                value: data
              },
              undefined,
              { replyToId }
            );
          }
        }

        scrollToEnd();
      } else {
        console.error(`Web Chat: received unknown action from Adaptive Cards`);
        console.error(action);
      }
    },
    [disabledRef, localize, markActionAsSelected, performCardAction, queueStaticElement, replyToId, scrollToEnd]
  );

  // For accessibility issue #1340, `tabindex="0"` must not be set for the root container if it is not interactive.
  const setTabIndexAtCardRoot = !!tapAction;

  const lastRenderRef = useRef<
    { readonly inputs: readonly unknown[]; readonly result: AdaptiveCardRenderResult } | undefined
  >(undefined);

  const { element, errors } = useMemo<AdaptiveCardRenderResult>(() => {
    const inputs = Object.freeze([
      adaptiveCard,
      adaptiveCardsHostConfig,
      GlobalSettings,
      HostConfig,
      renderMarkdownAsHTML,
      setTabIndexAtCardRoot
    ]);

    const { current: lastRender } = lastRenderRef;

    // Render the card once per inputs: the card reads its inputs from the DOM of its last render.
    // React 19 in Strict Mode calls `useMemo()` twice and keeps the first result, the inputs on screen would be detached from the card.
    if (lastRender && lastRender.inputs.every((value, index) => Object.is(value, inputs.at(index)))) {
      return lastRender.result;
    }

    undoActionShouldBePushButtonMod();
    undoActiveElementMod();
    undoDisabledMod();
    undoImageAltTextMod();
    undoPersistValuesMod();
    undoRoleMod();

    const result: AdaptiveCardRenderResult = Object.freeze(
      renderAdaptiveCard(adaptiveCard, {
        adaptiveCardsHostConfig,
        adaptiveCardsPackage: { GlobalSettings, HostConfig },
        renderMarkdownAsHTML,
        setTabIndexAtCardRoot
      })
    );

    lastRenderRef.current = Object.freeze({ inputs, result });

    return result;
  }, [
    adaptiveCard,
    adaptiveCardsHostConfig,
    GlobalSettings,
    HostConfig,
    renderMarkdownAsHTML,
    setTabIndexAtCardRoot,
    undoActionShouldBePushButtonMod,
    undoActiveElementMod,
    undoDisabledMod,
    undoImageAltTextMod,
    undoPersistValuesMod,
    undoRoleMod
  ]);

  useMemo(() => {
    // Intentionally modifying the `onExecuteAction` because the API design of Adaptive Cards.
    // eslint-disable-next-line react-hooks/immutability
    adaptiveCard.onExecuteAction = handleExecuteAction;
  }, [adaptiveCard, handleExecuteAction]);

  useLayoutEffect(() => {
    contentRef.current?.replaceChildren(element);
  }, [contentRef, element]);

  const elementRef = useRefFrom(element);
  useEffect(() => () => elementRef.current?.remove(), [elementRef]);

  // Apply all mods regardless whether the element changed or not.
  // This is because we have undoed mods when we call the `useXXXModEffect` hook.
  useLayoutEffect(() => {
    if (element) {
      applyActionShouldBePushButtonMod(
        element,
        cx(classNames['adaptive-card-renderer__action--selected'], actionPerformedClassName),
        selectedDescriptionId
      );
      applyActiveElementMod(element);
      applyDisabledMod(element, disabled);
      applyImageAltTextMod(element);
      applyPersistValuesMod(element);
      applyRoleMod(element);
    }
  }, [
    actionPerformedClassName,
    applyActionShouldBePushButtonMod,
    applyActiveElementMod,
    applyDisabledMod,
    applyImageAltTextMod,
    applyPersistValuesMod,
    applyRoleMod,
    classNames,
    disabled,
    element,
    selectedDescriptionId
  ]);

  errors?.length && console.warn('botframework-webchat: Failed to render Adaptive Cards.', errors);

  return errors?.length ? (
    <ErrorBoxPolymiddlewareProxy error={errors[0]} where={localize('ADAPTIVE_CARD_ERROR_BOX_TITLE_RENDER')} />
  ) : (
    <Fragment>
      <div
        className={classNames['adaptive-card-renderer']}
        onClick={handleClickAndKeyPressForTapAction as MouseEventHandler<HTMLDivElement>}
        onKeyPress={handleClickAndKeyPressForTapAction as KeyboardEventHandler<HTMLDivElement>}
        ref={contentRef}
      />
      {/* `id` is required for `aria-describedby` of the selected action */}
      {/* eslint-disable-next-line react/forbid-dom-props */}
      <span hidden={true} id={selectedDescriptionId}>
        {localize('ADAPTIVE_CARD_ACTION_SELECTED_ALT')}
      </span>
    </Fragment>
  );
}

export default memo(AdaptiveCardRenderer);
export { adaptiveCardRendererPropsSchema, type AdaptiveCardRendererProps };
