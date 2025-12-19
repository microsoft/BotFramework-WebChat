/* eslint no-magic-numbers: ["error", { "ignore": [-1, 0, 2] }] */

import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { type Action as AdaptiveCardAction, type OpenUrlAction, type SubmitAction } from 'adaptivecards';
import { ErrorBoxPolymiddlewareProxy } from 'botframework-webchat-api/middleware';
import { getTabIndex, hooks } from 'botframework-webchat-component';
import { type DirectLineCardAction } from 'botframework-webchat-core';
import classNames from 'classnames';
import React, {
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

import useStyleSet from '../../hooks/useStyleSet';
import useAdaptiveCardsHostConfig from '../hooks/useAdaptiveCardsHostConfig';
import useAdaptiveCardsPackage from '../hooks/useAdaptiveCardsPackage';
import { BotFrameworkCardAction } from './AdaptiveCardBuilder';
import useValueRef from './AdaptiveCardHacks/private/useValueRef';
import useActionShouldBePushButtonModEffect from './AdaptiveCardHacks/useActionShouldBePushButtonModEffect';
import useActiveElementModEffect from './AdaptiveCardHacks/useActiveElementModEffect';
import useDisabledModEffect from './AdaptiveCardHacks/useDisabledModEffect';
import usePersistValuesModEffect from './AdaptiveCardHacks/usePersistValuesModEffect';
import useRoleModEffect from './AdaptiveCardHacks/useRoleModEffect';
import { directLineCardActionSchema } from './private/directLineSchema';
import renderAdaptiveCard from './private/renderAdaptiveCard';

const { useLocalizer, usePerformCardAction, useRenderMarkdownAsHTML, useScrollToEnd, useUIState } = hooks;

const adaptiveCardRendererPropsSchema = pipe(
  object({
    actionPerformedClassName: optional(string()),
    disabled: optional(boolean()),
    adaptiveCard: any(),
    tapAction: optional(directLineCardActionSchema)
  }),
  readonly()
);

type AdaptiveCardRendererProps = InferInput<typeof adaptiveCardRendererPropsSchema>;

function AdaptiveCardRenderer(props: AdaptiveCardRendererProps) {
  const {
    actionPerformedClassName,
    adaptiveCard,
    disabled: disabledFromProps,
    tapAction
  } = validateProps(adaptiveCardRendererPropsSchema, props);

  const [{ adaptiveCardRenderer: adaptiveCardRendererStyleSet }] = useStyleSet();
  const [{ GlobalSettings, HostConfig }] = useAdaptiveCardsPackage();
  const [adaptiveCardsHostConfig] = useAdaptiveCardsHostConfig();
  const [uiState] = useUIState();
  const contentRef = useRef<HTMLDivElement>();
  const localize = useLocalizer();
  const performCardAction = usePerformCardAction();
  const renderMarkdownAsHTML = useRenderMarkdownAsHTML('adaptive cards');
  const scrollToEnd = useScrollToEnd();

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

      performCardAction(tapActionRef.current as DirectLineCardAction);
      scrollToEnd();
    },
    [contentRef, performCardAction, scrollToEnd, tapActionRef]
  );

  // Only listen to event if it is not disabled and have "tapAction" prop.
  const handleClickAndKeyPressForTapAction = !disabled && tapAction ? handleClickAndKeyPress : undefined;

  const handleExecuteAction = useCallback(
    (action: AdaptiveCardAction): void => {
      // Some items, e.g. tappable image, cannot be disabled thru DOM attributes
      if (disabledRef.current) {
        return;
      }

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
    [disabledRef, performCardAction, scrollToEnd]
  );

  // For accessibility issue #1340, `tabindex="0"` must not be set for the root container if it is not interactive.
  const setTabIndexAtCardRoot = !!tapAction;

  const [applyActionShouldBePushButtonMod, undoActionShouldBePushButtonMod] =
    useActionShouldBePushButtonModEffect(adaptiveCard);
  const [applyActiveElementMod, undoActiveElementMod] = useActiveElementModEffect(adaptiveCard);
  const [applyDisabledMod, undoDisabledMod] = useDisabledModEffect(adaptiveCard);
  const [applyPersistValuesMod, undoPersistValuesMod] = usePersistValuesModEffect(adaptiveCard);
  const [applyRoleMod, undoRoleMod] = useRoleModEffect(adaptiveCard);

  const { element, errors }: { element?: HTMLElement; errors?: Error[] } = useMemo(() => {
    undoActionShouldBePushButtonMod();
    undoActiveElementMod();
    undoDisabledMod();
    undoPersistValuesMod();
    undoRoleMod();

    return renderAdaptiveCard(adaptiveCard, {
      adaptiveCardsHostConfig,
      adaptiveCardsPackage: { GlobalSettings, HostConfig },
      renderMarkdownAsHTML,
      setTabIndexAtCardRoot
    });
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
      applyActionShouldBePushButtonMod(element, actionPerformedClassName);
      applyActiveElementMod(element);
      applyDisabledMod(element, disabled);
      applyPersistValuesMod(element);
      applyRoleMod(element);
    }
  }, [
    actionPerformedClassName,
    applyActionShouldBePushButtonMod,
    applyActiveElementMod,
    applyDisabledMod,
    applyPersistValuesMod,
    applyRoleMod,
    disabled,
    element
  ]);

  errors?.length && console.warn('botframework-webchat: Failed to render Adaptive Cards.', errors);

  return errors?.length ? (
    <ErrorBoxPolymiddlewareProxy error={errors[0]} where={localize('ADAPTIVE_CARD_ERROR_BOX_TITLE_RENDER')} />
  ) : (
    <div
      className={classNames(adaptiveCardRendererStyleSet + '', 'webchat__adaptive-card-renderer')}
      onClick={handleClickAndKeyPressForTapAction as MouseEventHandler<HTMLDivElement>}
      onKeyPress={handleClickAndKeyPressForTapAction as KeyboardEventHandler<HTMLDivElement>}
      ref={contentRef}
    />
  );
}

export default memo(AdaptiveCardRenderer);
export { adaptiveCardRendererPropsSchema, type AdaptiveCardRendererProps };
