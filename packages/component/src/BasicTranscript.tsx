import { hooks } from 'botframework-webchat-api';
import {
  Composer as ReactScrollToBottomComposer,
  Panel as ReactScrollToBottomPanel,
  useAnimatingToEnd,
  useAtEnd,
  useObserveScrollPosition,
  useScrollTo,
  useScrollToEnd,
  useSticky
} from 'react-scroll-to-bottom';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { forwardRef, Fragment, useCallback, useMemo, useRef } from 'react';

import type { ActivityComponentFactory, AvatarComponentFactory } from 'botframework-webchat-api';
import type { ActivityElementMap } from './Transcript/types';
import type { FC, KeyboardEventHandler, MutableRefObject, ReactNode, VFC } from 'react';
import type { WebChatActivity } from 'botframework-webchat-core';

import { android } from './Utils/detectBrowser';
import ActivityRow from './Transcript/ActivityRow';
import BasicTypingIndicator from './BasicTypingIndicator';
import FocusRedirector from './Utils/FocusRedirector';
import inputtableKey from './Utils/TypeFocusSink/inputtableKey';
import isZeroOrPositive from './Utils/isZeroOrPositive';
import KeyboardHelp from './Transcript/KeyboardHelp';
import LiveRegionTranscript from './Transcript/LiveRegionTranscript';
// TODO: [P2] #4133 Rename to "getTabbableElements".
import tabbableElements from './Utils/tabbableElements';
import TranscriptFocusComposer from './providers/TranscriptFocus/TranscriptFocusComposer';
import useActiveDescendantId from './providers/TranscriptFocus/useActiveDescendantId';
import useActivityTreeWithRenderer from './providers/ActivityTree/useActivityTreeWithRenderer';
import useDispatchScrollPosition from './hooks/internal/useDispatchScrollPosition';
import useDispatchTranscriptFocusByActivityKey from './hooks/internal/useDispatchTranscriptFocusByActivityKey';
import useFocus from './hooks/useFocus';
import useFocusByActivityKey from './providers/TranscriptFocus/useFocusByActivityKey';
import useFocusedActivityKey from './providers/TranscriptFocus/useFocusedActivityKey';
import useFocusedExplicitly from './providers/TranscriptFocus/useFocusedExplicitly';
import useFocusRelativeActivity from './providers/TranscriptFocus/useFocusRelativeActivity';
import useObserveFocusVisible from './hooks/internal/useObserveFocusVisible';
import usePrevious from './hooks/internal/usePrevious';
import useRegisterFocusTranscript from './hooks/internal/useRegisterFocusTranscript';
import useRegisterScrollRelative from './hooks/internal/useRegisterScrollRelative';
import useRegisterScrollTo from './hooks/internal/useRegisterScrollTo';
import useRegisterScrollToEnd from './hooks/internal/useRegisterScrollToEnd';
import useStyleSet from './hooks/useStyleSet';
import useStyleToEmotionObject from './hooks/internal/useStyleToEmotionObject';
import useUniqueId from './hooks/internal/useUniqueId';
import useValueRef from './hooks/internal/useValueRef';

const {
  useActivityKeys,
  useActivityKeysByRead,
  useCreateActivityStatusRenderer,
  useCreateAvatarRenderer,
  useCreateScrollToEndButtonRenderer,
  useDirection,
  useGetActivityByKey,
  useGetKeyByActivity,
  useGetKeyByActivityId,
  useLastAcknowledgedActivityKey,
  useLocalizer,
  useMarkActivityKeyAsRead,
  useMarkAllAsAcknowledged,
  useStyleOptions
} = hooks;

const ROOT_STYLE = {
  '&.webchat__basic-transcript': {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    // Make sure to set "position: relative" here to form another stacking context for the scroll-to-end button.
    // Stacking context help isolating elements that use "z-index" from global pollution.
    // https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index/The_stacking_context
    position: 'relative',

    '& .webchat__basic-transcript__filler': {
      flex: 1
    },

    '& .webchat__basic-transcript__scrollable': {
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden',
      WebkitOverflowScrolling: 'touch'
    },

    '& .webchat__basic-transcript__transcript': {
      listStyleType: 'none'
    }
  }
};

type RenderingElement = {
  activity: WebChatActivity;
  callbackRef: (element: HTMLElement) => void;
  hideTimestamp: boolean;
  key: string;
  renderActivity: Exclude<ReturnType<ActivityComponentFactory>, false>;
  renderActivityStatus: (props: { hideTimestamp?: boolean }) => ReactNode;
  renderAvatar: AvatarComponentFactory;
  showCallout: boolean;
};

type ScrollBehavior = 'auto' | 'smooth';
type ScrollToOptions = { behavior?: ScrollBehavior };
type ScrollToPosition = { activityID?: string; scrollTop?: number };

type InternalTranscriptProps = {
  activityElementMapRef: MutableRefObject<ActivityElementMap>;
  className?: string;
};

// TODO: [P1] #4133 Add telemetry for computing how many re-render done so far.
const InternalTranscript = forwardRef<HTMLDivElement, InternalTranscriptProps>(
  ({ activityElementMapRef, className }, ref) => {
    const [{ basicTranscript: basicTranscriptStyleSet }] = useStyleSet();
    const [{ bubbleFromUserNubOffset, bubbleNubOffset, groupTimestamp, showAvatarInGroup }] = useStyleOptions();
    const [activeDescendantId] = useActiveDescendantId();
    const [activityWithRendererTree] = useActivityTreeWithRenderer();
    const [direction] = useDirection();
    const [focusedActivityKey] = useFocusedActivityKey();
    const [focusedExplicitly] = useFocusedExplicitly();
    const createActivityStatusRenderer = useCreateActivityStatusRenderer();
    const createAvatarRenderer = useCreateAvatarRenderer();
    const focus = useFocus();
    const focusByActivityKey = useFocusByActivityKey();
    const focusRelativeActivity = useFocusRelativeActivity();
    const getActivityByKey = useGetActivityByKey();
    const getKeyByActivity = useGetKeyByActivity();
    const getKeyByActivityId = useGetKeyByActivityId();
    const localize = useLocalizer();
    const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';
    const rootElementRef = useRef<HTMLDivElement>();
    const terminatorLabelId = useUniqueId('webchat__basic-transcript__terminator-label');
    const terminatorRef = useRef<HTMLDivElement>();

    const focusedActivityKeyRef = useValueRef(focusedActivityKey);
    const hideAllTimestamps = groupTimestamp === false;
    const terminatorText = localize('TRANSCRIPT_TERMINATOR_TEXT');
    const transcriptAriaLabel = localize('TRANSCRIPT_ARIA_LABEL_ALT');

    const callbackRef = useCallback(
      (element: HTMLDivElement) => {
        if (typeof ref === 'function') {
          ref(element);
        } else {
          ref.current = element;
        }

        rootElementRef.current = element;
      },
      [ref, rootElementRef]
    );

    // Flatten the tree back into an array with information related to rendering.
    const renderingElements = useMemo(() => {
      const renderingElements: RenderingElement[] = [];
      const topSideBotNub = isZeroOrPositive(bubbleNubOffset);
      const topSideUserNub = isZeroOrPositive(bubbleFromUserNubOffset);

      activityWithRendererTree.forEach(entriesWithSameSender => {
        const [[{ activity: firstActivity }]] = entriesWithSameSender;
        const renderAvatar = createAvatarRenderer({ activity: firstActivity });

        entriesWithSameSender.forEach((entriesWithSameSenderAndStatus, indexWithinSenderGroup) => {
          const firstInSenderGroup = !indexWithinSenderGroup;
          const lastInSenderGroup = indexWithinSenderGroup === entriesWithSameSender.length - 1;

          entriesWithSameSenderAndStatus.forEach(({ activity, renderActivity }, indexWithinSenderAndStatusGroup) => {
            // We only show the timestamp at the end of the sender group. But we always show the "Send failed, retry" prompt.
            const firstInSenderAndStatusGroup = !indexWithinSenderAndStatusGroup;
            const key: string = getKeyByActivity(activity);
            const lastInSenderAndStatusGroup =
              indexWithinSenderAndStatusGroup === entriesWithSameSenderAndStatus.length - 1;
            const renderActivityStatus = createActivityStatusRenderer({
              activity,
              nextVisibleActivity: undefined
            });
            const topSideNub = activity.from?.role === 'user' ? topSideUserNub : topSideBotNub;

            let showCallout: boolean;

            // Depending on the "showAvatarInGroup" setting, the avatar will render in different positions.
            if (showAvatarInGroup === 'sender') {
              if (topSideNub) {
                showCallout = firstInSenderGroup && firstInSenderAndStatusGroup;
              } else {
                showCallout = lastInSenderGroup && lastInSenderAndStatusGroup;
              }
            } else if (showAvatarInGroup === 'status') {
              if (topSideNub) {
                showCallout = firstInSenderAndStatusGroup;
              } else {
                showCallout = lastInSenderAndStatusGroup;
              }
            } else {
              showCallout = true;
            }

            renderingElements.push({
              activity,

              // After the element is mounted, set it to activityElementsRef.
              callbackRef: activityElement => {
                activityElement
                  ? activityElementMapRef.current.set(key, activityElement)
                  : activityElementMapRef.current.delete(key);
              },

              // "hideTimestamp" is a render-time parameter for renderActivityStatus().
              // If true, it will hide the timestamp, but it will continue to show the
              // retry prompt. And show the screen reader version of the timestamp.
              hideTimestamp:
                hideAllTimestamps || indexWithinSenderAndStatusGroup !== entriesWithSameSenderAndStatus.length - 1,
              key,
              renderActivity,
              renderActivityStatus,
              renderAvatar,
              showCallout
            });
          });
        });
      });

      return renderingElements;
    }, [
      activityElementMapRef,
      activityWithRendererTree,
      bubbleFromUserNubOffset,
      bubbleNubOffset,
      createActivityStatusRenderer,
      createAvatarRenderer,
      getKeyByActivity,
      hideAllTimestamps,
      showAvatarInGroup
    ]);

    const scrollToBottomScrollTo: (scrollTop: number, options?: ScrollToOptions) => void = useScrollTo();
    const scrollToBottomScrollToEnd: (options?: ScrollToOptions) => void = useScrollToEnd();

    const scrollTo = useCallback(
      (position: ScrollToPosition, { behavior = 'auto' }: ScrollToOptions = {}) => {
        if (!position) {
          throw new Error(
            'botframework-webchat: First argument passed to "useScrollTo" must be a ScrollPosition object.'
          );
        }

        const { activityID: activityId, scrollTop } = position;

        if (typeof scrollTop !== 'undefined') {
          scrollToBottomScrollTo(scrollTop, { behavior });
        } else if (typeof activityId !== 'undefined') {
          const activityBoundingBoxElement = activityElementMapRef.current
            .get(getKeyByActivityId(activityId))
            ?.querySelector('.webchat__basic-transcript__activity-active-descendant');

          const scrollableElement = rootElementRef.current.querySelector('.webchat__basic-transcript__scrollable');

          if (scrollableElement && activityBoundingBoxElement) {
            // ESLint conflict with TypeScript. The result of getClientRects() is not an Array but DOMRectList, and cannot be destructured.
            // eslint-disable-next-line prefer-destructuring
            const activityBoundingBoxElementClientRect = activityBoundingBoxElement.getClientRects()[0];

            // ESLint conflict with TypeScript. The result of getClientRects() is not an Array but DOMRectList, and cannot be destructured.
            // eslint-disable-next-line prefer-destructuring
            const scrollableElementClientRect = scrollableElement.getClientRects()[0];

            // If either the activity or the transcript scrollable is not on DOM, we will not scroll the view.
            if (activityBoundingBoxElementClientRect && scrollableElementClientRect) {
              const { height: activityHeight, y: activityY } = activityBoundingBoxElementClientRect;
              const { height: scrollableHeight } = scrollableElementClientRect;
              const activityOffsetTop = activityY + scrollableElement.scrollTop;

              const scrollTop = Math.min(activityOffsetTop, activityOffsetTop - scrollableHeight + activityHeight);

              scrollToBottomScrollTo(scrollTop, { behavior });
            }
          }
        }
      },
      [activityElementMapRef, getKeyByActivityId, rootElementRef, scrollToBottomScrollTo]
    );

    const scrollToEnd = useCallback(
      () => scrollToBottomScrollToEnd({ behavior: 'smooth' }),
      [scrollToBottomScrollToEnd]
    );

    const scrollRelative = useCallback(
      (direction: 'down' | 'up', { displacement }: { displacement?: number } = {}) => {
        const { current: rootElement } = rootElementRef;

        if (!rootElement) {
          return;
        }

        const scrollable: HTMLElement = rootElement.querySelector('.webchat__basic-transcript__scrollable');
        let nextScrollTop: number;

        if (typeof displacement === 'number') {
          // eslint-disable-next-line no-magic-numbers
          nextScrollTop = scrollable.scrollTop + (direction === 'down' ? 1 : -1) * displacement;
        } else {
          // eslint-disable-next-line no-magic-numbers
          nextScrollTop = scrollable.scrollTop + (direction === 'down' ? 1 : -1) * scrollable.offsetHeight;
        }

        scrollTo(
          {
            scrollTop: Math.max(0, Math.min(scrollable.scrollHeight - scrollable.offsetHeight, nextScrollTop))
          },
          { behavior: 'smooth' }
        );
      },
      [rootElementRef, scrollTo]
    );

    // Since there could be multiple instances of <BasicTranscript> inside the <Composer>, when the developer calls `scrollXXX`, we need to call it on all instances.
    // We call `useRegisterScrollXXX` to register a callback function, the `useScrollXXX` will multiplex the call into each instance of <BasicTranscript>.
    useRegisterScrollTo(scrollTo);
    useRegisterScrollToEnd(scrollToEnd);
    useRegisterScrollRelative(scrollRelative);

    const markActivityKeyAsRead = useMarkActivityKeyAsRead();

    const dispatchScrollPositionWithActivityId: (scrollPosition: ScrollToPosition) => void =
      useDispatchScrollPosition();

    // TODO: [P2] We should use IntersectionObserver to track what activity is in the scrollable.
    //            However, IntersectionObserver is not available on IE11, we need to make a limited polyfill in React style.
    const handleScrollPosition = useCallback(
      ({ scrollTop }: { scrollTop: number }) => {
        const { current: rootElement } = rootElementRef;

        if (!rootElement) {
          return;
        }

        const scrollableElement = rootElement.querySelector('.webchat__basic-transcript__scrollable');

        // "getClientRects()" is not returning an array, thus, it is not destructurable.
        // eslint-disable-next-line prefer-destructuring
        const scrollableElementClientRect = scrollableElement.getClientRects()[0];

        // If the scrollable is not mounted, we cannot measure which activity is in view. Thus, we will not fire any events.
        if (!scrollableElementClientRect) {
          return;
        }

        const { bottom: scrollableClientBottom } = scrollableElementClientRect;

        // Find the activity just above scroll view bottom.
        // If the scroll view is already on top, get the first activity.
        const activityElements = Array.from(activityElementMapRef.current.entries());
        const activityKeyJustAboveScrollBottom: string | undefined = (
          scrollableElement.scrollTop
            ? activityElements
                .reverse()
                // Add subpixel tolerance
                .find(([, element]) => {
                  // "getClientRects()" is not returning an array, thus, it is not destructurable.
                  // eslint-disable-next-line prefer-destructuring
                  const elementClientRect = element.getClientRects()[0];

                  // If the activity is not attached to DOM tree, we should not count it as "bottommost visible activity", as it is not visible.
                  return elementClientRect && elementClientRect.bottom < scrollableClientBottom + 1;
                })
            : activityElements[0]
        )?.[0];

        // When the end-user slowly scrolling the view down, we will mark activity as read when the message fully appear on the screen.
        activityKeyJustAboveScrollBottom && markActivityKeyAsRead(activityKeyJustAboveScrollBottom);

        if (dispatchScrollPositionWithActivityId) {
          const activity = getActivityByKey(activityKeyJustAboveScrollBottom);

          dispatchScrollPositionWithActivityId({ ...(activity ? { activityID: activity.id } : {}), scrollTop });
        }
      },
      [
        activityElementMapRef,
        dispatchScrollPositionWithActivityId,
        getActivityByKey,
        markActivityKeyAsRead,
        rootElementRef
      ]
    );

    useObserveScrollPosition(handleScrollPosition);

    const handleTranscriptKeyDown = useCallback<KeyboardEventHandler<HTMLDivElement>>(
      event => {
        const { target } = event;

        const fromEndOfTranscriptIndicator = target === terminatorRef.current;
        const fromTranscript = target === event.currentTarget;

        if (!fromEndOfTranscriptIndicator && !fromTranscript) {
          return;
        }

        let handled = true;

        switch (event.key) {
          case 'ArrowDown':
            focusRelativeActivity(fromEndOfTranscriptIndicator ? 0 : 1);
            break;

          case 'ArrowUp':
            // eslint-disable-next-line no-magic-numbers
            focusRelativeActivity(fromEndOfTranscriptIndicator ? 0 : -1);
            break;

          case 'End':
            focusRelativeActivity(Infinity);
            break;

          case 'Enter':
            // This is capturing plain ENTER.
            // When screen reader is not running, or screen reader is running outside of scan mode, the ENTER key will be captured here.
            if (!fromEndOfTranscriptIndicator) {
              const body: HTMLElement = activityElementMapRef.current
                .get(focusedActivityKeyRef.current)
                ?.querySelector('.webchat__basic-transcript__activity-body');

              tabbableElements(body)[0]?.focus();
            }

            break;

          case 'Escape':
            focus('sendBoxWithoutKeyboard');
            break;

          case 'Home':
            focusRelativeActivity(-Infinity);
            break;

          default:
            handled = false;
            break;
        }

        if (handled) {
          event.preventDefault();

          // If a custom HTML control wants to handle up/down arrow, we will prevent them from listening to this event to prevent bugs due to handling arrow keys twice.
          event.stopPropagation();
        }
      },
      [activityElementMapRef, focus, focusedActivityKeyRef, focusRelativeActivity, terminatorRef]
    );

    const handleTranscriptKeyDownCapture = useCallback<KeyboardEventHandler<HTMLDivElement>>(
      event => {
        const { altKey, ctrlKey, key, metaKey, target } = event;

        if (altKey || (ctrlKey && key !== 'v') || metaKey || (!inputtableKey(key) && key !== 'Backspace')) {
          // Ignore if one of the utility key (except SHIFT) is pressed
          // E.g. CTRL-C on a link in one of the message should not jump to chat box
          // E.g. "A" or "Backspace" should jump to chat box
          return;
        }

        // Send keystrokes to send box if we are focusing on the transcript or terminator.
        if (target === event.currentTarget || target === terminatorRef.current) {
          event.stopPropagation();

          focus('sendBox');
        }
      },
      [focus]
    );

    useRegisterFocusTranscript(useCallback(() => focusByActivityKey(undefined), [focusByActivityKey]));

    // When the focusing activity has changed, dispatch an event to observers of "useObserveTranscriptFocus".
    const dispatchTranscriptFocusByActivityKey = useDispatchTranscriptFocusByActivityKey();

    // Dispatch a "transcript focus" event based on user selection.
    // We should not dispatch "transcript focus" when a new activity come. Although the selection change, it is not initiated from the user.
    useMemo(
      () => dispatchTranscriptFocusByActivityKey(focusedExplicitly ? focusedActivityKey : undefined),
      [dispatchTranscriptFocusByActivityKey, focusedActivityKey, focusedExplicitly]
    );

    // When the transcript is being focused on, we should dispatch a "transcriptfocus" event.
    const handleFocus = useCallback(
      // We call "focusByActivityKey" with activity key of "true".
      // It means, tries to focus on anything.
      ({ currentTarget, target }) => target === currentTarget && focusByActivityKey(true, false),
      [focusByActivityKey]
    );

    // This is required by IE11.
    // When the user clicks on and empty space (a.k.a. filler) in an empty transcript, IE11 says the focus is on the <div className="filler">,
    // despite the fact there are no "tabIndex" attributes set on the filler.
    // We need to artificially send the focus back to the transcript.
    const handleFocusFiller = useCallback(() => focusByActivityKey(undefined), [focusByActivityKey]);

    // When focus into the transcript using TAB/SHIFT-TAB, scroll the focused activity into view.
    useObserveFocusVisible(
      rootElementRef,
      useCallback(() => focusByActivityKey(undefined), [focusByActivityKey])
    );

    return (
      <div
        // Although Android TalkBack 12.1 does not support `aria-activedescendant`, when used, it become buggy and will narrate content twice.
        // We are disabling `aria-activedescendant` for Android. See <ActivityRow> for details.
        aria-activedescendant={android ? undefined : activeDescendantId}
        aria-label={transcriptAriaLabel}
        className={classNames(
          'webchat__basic-transcript',
          basicTranscriptStyleSet + '',
          rootClassName,
          (className || '') + ''
        )}
        dir={direction}
        onFocus={handleFocus}
        onKeyDown={handleTranscriptKeyDown}
        onKeyDownCapture={handleTranscriptKeyDownCapture}
        ref={callbackRef}
        // "aria-activedescendant" will only works with a number of roles and it must be explicitly set.
        // https://www.w3.org/TR/wai-aria/#aria-activedescendant
        role="group"
        // For up/down arrow key navigation across activities, this component must be included in the tab sequence.
        // Otherwise, "aria-activedescendant" will not be narrated when the user press up/down arrow keys.
        // https://www.w3.org/TR/wai-aria-practices-1.1/#kbd_focus_activedescendant
        tabIndex={0}
      >
        <LiveRegionTranscript activityElementMapRef={activityElementMapRef} />
        {/* TODO: [P2] Fix ESLint error `no-use-before-define` */}
        {/* eslint-disable-next-line @typescript-eslint/no-use-before-define */}
        <InternalTranscriptScrollable onFocusFiller={handleFocusFiller} terminatorRef={terminatorRef}>
          {renderingElements.map(
            ({
              activity,
              callbackRef,
              hideTimestamp,
              key,
              renderActivity,
              renderActivityStatus,
              renderAvatar,
              showCallout
            }) => (
              <ActivityRow activity={activity} key={key} ref={callbackRef}>
                {renderActivity({
                  hideTimestamp,
                  renderActivityStatus,
                  renderAvatar,
                  showCallout
                })}
              </ActivityRow>
            )
          )}
        </InternalTranscriptScrollable>
        {!!renderingElements.length && (
          <Fragment>
            <FocusRedirector redirectRef={rootElementRef} />
            <div
              aria-hidden={true}
              aria-labelledby={terminatorLabelId}
              className="webchat__basic-transcript__terminator"
              ref={terminatorRef}
              role="note"
              tabIndex={0}
            >
              <div className="webchat__basic-transcript__terminator-body">
                {/* `id` is required for `aria-labelledby` */}
                {/* eslint-disable-next-line react/forbid-dom-props */}
                <div className="webchat__basic-transcript__terminator-text" id={terminatorLabelId}>
                  {terminatorText}
                </div>
              </div>
            </div>
          </Fragment>
        )}
        <div className="webchat__basic-transcript__focus-indicator" />
      </div>
    );
  }
);

InternalTranscript.defaultProps = {
  className: ''
};

InternalTranscript.propTypes = {
  // PropTypes cannot validate precisely with its TypeScript counterpart.
  // @ts-ignore
  activityElementMapRef: PropTypes.shape({
    current: PropTypes.instanceOf(Map)
  }).isRequired,
  className: PropTypes.string
};

type InternalTranscriptScrollableProps = {
  children?: ReactNode;
  onFocusFiller: () => void;
  terminatorRef: MutableRefObject<HTMLDivElement>;
};

// Separating high-frequency hooks to improve performance.
const InternalTranscriptScrollable: FC<InternalTranscriptScrollableProps> = ({
  children,
  onFocusFiller,
  terminatorRef
}) => {
  const [{ activities: activitiesStyleSet }] = useStyleSet();
  const [animatingToEnd]: [boolean] = useAnimatingToEnd();
  const [atEnd]: [boolean] = useAtEnd();
  const [, unreadActivityKeys] = useActivityKeysByRead();
  const [sticky]: [boolean] = useSticky();
  const [styleOptions] = useStyleOptions();
  const focusByActivityKey = useFocusByActivityKey();
  const localize = useLocalizer();
  const markActivityKeyAsRead = useMarkActivityKeyAsRead();
  const markAllAsAcknowledged = useMarkAllAsAcknowledged();
  const scrollToEnd: (options?: ScrollToOptions) => void = useScrollToEnd();

  const prevSticky = usePrevious(sticky);
  const transcriptRoleDescription = localize('TRANSCRIPT_ARIA_ROLE_ALT');

  const stickyChangedToTrue = prevSticky !== sticky && sticky;

  // Acknowledged means either:
  // 1. The user sent a message
  //    - We don't need a condition here. When Web Chat sends the user's message, it will scroll to bottom, and it will trigger condition 2 below.
  // 2. The user scroll to the bottom of the transcript, from a non-bottom scroll position
  //    - If the transcript is already at the bottom, the user needs to scroll up and then go back down
  //    - What happens if we are relaxing "scrolled from a non-bottom scroll position":
  //      1. The condition will become solely "at the bottom of the transcript"
  //      2. Auto-scroll will always scroll the transcript to the bottom
  //      3. Web Chat will always acknowledge all activities as it is at the bottom
  //      4. Acknowledge flag become useless
  //      5. Therefore, even the developer set "pause after 3 activities", if activities are coming in at a slow pace (not batched in a single render)
  //         Web Chat will keep scrolling and not snapped/paused

  // Note: When Web Chat is loaded, there are no activities acknowledged. We need to assume all arriving activities are acknowledged until end-user sends their first activity.
  //       Activities loaded initially could be from conversation history. Without assuming acknowledgement, Web Chat will not scroll initially (as everything is not acknowledged).
  //       It would be better if the chat adapter should let Web Chat know if the activity is loaded from history or not.

  // TODO: [P2] #3670 Move the "conversation history acknowledgement" logic mentioned above to polyfill of chat adapters.
  //       1. Chat adapter should send "acknowledged" as part of "channelData"
  //       2. If "acknowledged" is "undefined", we set it to:
  //          a. true, if there are no egress activities yet
  //          b. Otherwise, false

  useMemo(
    () =>
      stickyChangedToTrue &&
      // TODO: [P2] Both `markActivityKeyAsRead` and `markAllAsAcknowledged` hook are setters of useState.
      //       This means, in a render loop, we will be calling setter and will cause another re-render.
      //       This is not trivial but we should think if there is a way to avoid this.
      markAllAsAcknowledged(),
    [markAllAsAcknowledged, stickyChangedToTrue]
  );

  const [flattenedActivityTreeWithRenderer] = useActivityTreeWithRenderer({ flat: true });
  const getKeyByActivity = useGetKeyByActivity();

  const renderingActivityKeys: string[] = useMemo<string[]>(
    () => flattenedActivityTreeWithRenderer.map(({ activity }) => getKeyByActivity(activity)),
    [flattenedActivityTreeWithRenderer, getKeyByActivity]
  );

  const renderingActivityKeysRef = useValueRef(renderingActivityKeys);

  // To prevent flashy button, we are not waiting for another render loop to update the `[readActivityKeys, unreadActivityKeys]` state.
  // Instead, we are building the next one in this `useMemo` call.
  const nextUnreadActivityKeys = useMemo(() => {
    // This code need to be careful reviewed as it will cause another render. The code should be converging.
    // After we call `markActivityKeyAsRead`, everything will be read and nothing will be unread.
    // That means, in next render, `unreadActivityKeys` will be emptied and the `markActivityKeyAsRead` will not get called again.
    if (sticky && unreadActivityKeys.length) {
      markActivityKeyAsRead(unreadActivityKeys[unreadActivityKeys.length - 1]);

      return [];
    }

    return unreadActivityKeys;
  }, [markActivityKeyAsRead, sticky, unreadActivityKeys]);

  const nextUnreadActivityKeysRef = useValueRef(nextUnreadActivityKeys);

  // If we are rendering anything that is unread, we should show the "New messages" button.
  // Not everything in the `unreadActivityKeys` are rendered, say, bot typing indicator.
  // We should not show the "New messages" button for bot typing indicator as it will confuse the user.
  const unread = useMemo(
    () => nextUnreadActivityKeys.some(key => renderingActivityKeys.includes(key)),
    [renderingActivityKeys, nextUnreadActivityKeys]
  );

  const handleScrollToEndButtonClick = useCallback(() => {
    scrollToEnd({ behavior: 'smooth' });

    const { current: renderingActivityKeys } = renderingActivityKeysRef;

    // After the "New message" button is clicked, focus on the first unread activity which will be rendered.
    const firstUnreadRenderingActivityKey = nextUnreadActivityKeysRef.current.find(key =>
      renderingActivityKeys.includes(key)
    );

    if (firstUnreadRenderingActivityKey) {
      focusByActivityKey(firstUnreadRenderingActivityKey);
    } else {
      // If no unread activity, send the focus to the terminator block.
      terminatorRef.current?.focus();
    }
  }, [focusByActivityKey, nextUnreadActivityKeysRef, renderingActivityKeysRef, scrollToEnd, terminatorRef]);

  const renderScrollToEndButton = useCreateScrollToEndButtonRenderer()({
    atEnd: animatingToEnd || atEnd || sticky,
    styleOptions,
    unread
  });

  return (
    <React.Fragment>
      {renderScrollToEndButton && renderScrollToEndButton({ onClick: handleScrollToEndButtonClick })}
      {!!React.Children.count(children) && <FocusRedirector redirectRef={terminatorRef} />}
      <ReactScrollToBottomPanel className="webchat__basic-transcript__scrollable">
        <div aria-hidden={true} className="webchat__basic-transcript__filler" onFocus={onFocusFiller} />
        <section
          aria-roledescription={transcriptRoleDescription}
          className={classNames(activitiesStyleSet + '', 'webchat__basic-transcript__transcript')}
          role="feed"
        >
          {children}
        </section>
        <BasicTypingIndicator />
      </ReactScrollToBottomPanel>
    </React.Fragment>
  );
};

InternalTranscriptScrollable.propTypes = {
  children: PropTypes.any.isRequired,
  onFocusFiller: PropTypes.func.isRequired,
  terminatorRef: PropTypes.any.isRequired
};

type Scroller = ({ offsetHeight, scrollTop }: { offsetHeight: number; scrollTop: number }) => number;

// "scroller" is the auto-scroll limiter, a.k.a. auto scroll snap.
const useScroller = (activityElementMapRef: MutableRefObject<ActivityElementMap>): Scroller => {
  const [activityKeys] = useActivityKeys();
  const [lastAcknowledgedActivityKey] = useLastAcknowledgedActivityKey();
  const [styleOptions] = useStyleOptions();

  const activityKeysRef = useValueRef(activityKeys);
  const lastAcknowledgedActivityKeyRef = useValueRef(lastAcknowledgedActivityKey);
  const styleOptionsRef = useValueRef(styleOptions);

  return useCallback(
    ({ offsetHeight, scrollTop }) => {
      const {
        current: {
          autoScrollSnapOnActivity,
          autoScrollSnapOnActivityOffset,
          autoScrollSnapOnPage,
          autoScrollSnapOnPageOffset
        }
      } = styleOptionsRef;

      const patchedAutoScrollSnapOnActivity =
        typeof autoScrollSnapOnActivity === 'number'
          ? Math.max(0, autoScrollSnapOnActivity)
          : autoScrollSnapOnActivity
          ? 1
          : 0;
      const patchedAutoScrollSnapOnPage =
        typeof autoScrollSnapOnPage === 'number'
          ? Math.max(0, Math.min(1, autoScrollSnapOnPage))
          : autoScrollSnapOnPage
          ? 1
          : 0;
      const patchedAutoScrollSnapOnActivityOffset =
        typeof autoScrollSnapOnActivityOffset === 'number' ? autoScrollSnapOnActivityOffset : 0;
      const patchedAutoScrollSnapOnPageOffset =
        typeof autoScrollSnapOnPageOffset === 'number' ? autoScrollSnapOnPageOffset : 0;

      if (patchedAutoScrollSnapOnActivity || patchedAutoScrollSnapOnPage) {
        const { current: activityElementMap } = activityElementMapRef;
        const { current: activityKeys } = activityKeysRef;
        const { current: lastAcknowledgedActivityKey } = lastAcknowledgedActivityKeyRef;
        const values: number[] = [];

        const lastAcknowledgedActivityKeyIndex = activityKeys.indexOf(lastAcknowledgedActivityKey);

        if (~lastAcknowledgedActivityKeyIndex) {
          // The activity that we acknowledged could be not rendered, such as post back activity.
          // When calculating scroll snap, we can only base on the first unacknowledged-and-rendering activity.
          const renderingActivityKeys = Array.from(activityElementMap.keys());
          let firstUnacknowledgedActivityElementIndex = -1;

          for (const acknowledgedActivityKey of activityKeys.slice(0, lastAcknowledgedActivityKeyIndex + 1).reverse()) {
            const index = renderingActivityKeys.indexOf(acknowledgedActivityKey);

            if (~index) {
              if (index !== renderingActivityKeys.length - 1) {
                firstUnacknowledgedActivityElementIndex = index + 1;
              }

              break;
            }
          }

          if (~firstUnacknowledgedActivityElementIndex) {
            const activityElements = Array.from(activityElementMap.values());

            if (patchedAutoScrollSnapOnActivity) {
              // Gets the activity element which we should snap to.
              const nthUnacknowledgedActivityElement =
                activityElements[firstUnacknowledgedActivityElementIndex + patchedAutoScrollSnapOnActivity - 1];

              if (nthUnacknowledgedActivityElement) {
                const nthUnacknowledgedActivityBoundingBoxElement = nthUnacknowledgedActivityElement?.querySelector(
                  '.webchat__basic-transcript__activity-active-descendant'
                ) as HTMLElement;
                const nthUnacknowledgedActivityOffsetTop =
                  nthUnacknowledgedActivityElement.offsetTop + nthUnacknowledgedActivityBoundingBoxElement.offsetTop;

                values.push(
                  nthUnacknowledgedActivityOffsetTop +
                    nthUnacknowledgedActivityBoundingBoxElement.offsetHeight -
                    offsetHeight -
                    scrollTop +
                    patchedAutoScrollSnapOnActivityOffset
                );
              }
            }

            if (patchedAutoScrollSnapOnPage) {
              const firstUnacknowledgedActivityElement = activityElements[+firstUnacknowledgedActivityElementIndex];
              const firstUnacknowledgedActivityBoundingBoxElement = firstUnacknowledgedActivityElement.querySelector(
                '.webchat__basic-transcript__activity-active-descendant'
              ) as HTMLElement;
              const firstUnacknowledgedActivityOffsetTop =
                firstUnacknowledgedActivityElement.offsetTop + firstUnacknowledgedActivityBoundingBoxElement.offsetTop;

              values.push(
                firstUnacknowledgedActivityOffsetTop -
                  scrollTop -
                  offsetHeight * (1 - patchedAutoScrollSnapOnPage) +
                  patchedAutoScrollSnapOnPageOffset
              );
            }
          }
        }

        return Math.min(...values);
      }

      return Infinity;
    },
    [activityElementMapRef, activityKeysRef, lastAcknowledgedActivityKeyRef, styleOptionsRef]
  );
};

type BasicTranscriptProps = {
  className?: string;
};

const BasicTranscript: VFC<BasicTranscriptProps> = ({ className }) => {
  const activityElementMapRef = useRef<ActivityElementMap>(new Map());
  const containerRef = useRef<HTMLDivElement>();

  const scroller = useScroller(activityElementMapRef);

  return (
    <TranscriptFocusComposer containerRef={containerRef}>
      <ReactScrollToBottomComposer scroller={scroller}>
        <KeyboardHelp />
        <InternalTranscript activityElementMapRef={activityElementMapRef} className={className} ref={containerRef} />
      </ReactScrollToBottomComposer>
    </TranscriptFocusComposer>
  );
};

BasicTranscript.defaultProps = {
  className: ''
};

BasicTranscript.propTypes = {
  className: PropTypes.string
};

export default BasicTranscript;
