// TODO: [P2] Fix ESLint error `no-use-before-define`
/* eslint-disable @typescript-eslint/no-use-before-define */

import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import React, {
  forwardRef,
  Fragment,
  memo,
  useCallback,
  useMemo,
  useRef,
  type KeyboardEventHandler,
  type MutableRefObject,
  type ReactNode
} from 'react';
import {
  Composer as ReactScrollToBottomComposer,
  Panel as ReactScrollToBottomPanel,
  useObserveScrollPosition,
  useScrollTo,
  useScrollToEnd,
  useSticky
} from 'react-scroll-to-bottom';
import { wrapWith } from 'react-wrap-with';

import BasicTypingIndicator from './BasicTypingIndicator';
import ChatHistoryBox from './ChatHistory/ChatHistoryBox';
import ChatHistoryToolbar from './ChatHistory/ChatHistoryToolbar';
import ScrollToEndButton from './ChatHistory/private/ScrollToEndButton';
import ActivityTree from './Transcript/ActivityTree';
import LiveRegionTranscript from './Transcript/LiveRegionTranscript';
import { type ActivityElementMap } from './Transcript/types';
import FocusRedirector from './Utils/FocusRedirector';
import inputtableKey from './Utils/TypeFocusSink/inputtableKey';
import { android } from './Utils/detectBrowser';
import { useStyleToEmotionObject } from './hooks/internal/styleToEmotionObject';
import useDispatchScrollPosition from './hooks/internal/useDispatchScrollPosition';
import useDispatchTranscriptFocusByActivityKey from './hooks/internal/useDispatchTranscriptFocusByActivityKey';
import useNonce from './hooks/internal/useNonce';
import useObserveFocusVisible from './hooks/internal/useObserveFocusVisible';
import usePrevious from './hooks/internal/usePrevious';
import useRegisterFocusTranscript from './hooks/internal/useRegisterFocusTranscript';
import useRegisterScrollTo from './hooks/internal/useRegisterScrollTo';
import useRegisterScrollToEnd from './hooks/internal/useRegisterScrollToEnd';
import useValueRef from './hooks/internal/useValueRef';
import {
  useRegisterScrollRelativeTranscript,
  type TranscriptScrollRelativeOptions
} from './hooks/transcriptScrollRelative';
import useFocus from './hooks/useFocus';
import useStyleSet from './hooks/useStyleSet';
import ChatHistoryDOMComposer from './providers/ChatHistoryDOM/ChatHistoryDOMComposer';
import useActivityElementMapRef from './providers/ChatHistoryDOM/useActivityElementRef';
import GroupedRenderingActivitiesComposer from './providers/GroupedRenderingActivities/GroupedRenderingActivitiesComposer';
import useNumRenderingActivities from './providers/GroupedRenderingActivities/useNumRenderingActivities';
import RenderingActivitiesComposer from './providers/RenderingActivities/RenderingActivitiesComposer';
import TranscriptFocusComposer from './providers/TranscriptFocus/TranscriptFocusComposer';
import useActiveDescendantId from './providers/TranscriptFocus/useActiveDescendantId';
import useFocusByActivityKey from './providers/TranscriptFocus/useFocusByActivityKey';
import useFocusRelativeActivity from './providers/TranscriptFocus/useFocusRelativeActivity';
import useFocusedKey from './providers/TranscriptFocus/useFocusedKey';
import useFocusedExplicitly from './providers/TranscriptFocus/useFocusedExplicitly';
import { TranscriptFocusArea, TranscriptFocusTerminator } from './Transcript/TranscriptFocus';
import TranscriptActivityList from './Transcript/TranscriptFocus/TranscriptActivityList';

const {
  useActivityKeys,
  useDirection,
  useGetActivityByKey,
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

type ScrollBehavior = 'auto' | 'smooth';
type ScrollToOptions = { behavior?: ScrollBehavior };
type ScrollToPosition = { activityID?: string; scrollTop?: number };

type InternalTranscriptProps = Readonly<{
  className?: string;
  terminatorRef: React.MutableRefObject<HTMLDivElement>;
}>;

// TODO: [P1] #4133 Add telemetry for computing how many re-render done so far.
const InternalTranscript = forwardRef<HTMLDivElement, InternalTranscriptProps>(
  ({ className, terminatorRef }: InternalTranscriptProps, ref) => {
    const [activeDescendantId] = useActiveDescendantId();
    const [direction] = useDirection();
    const [focusedKey] = useFocusedKey();
    const [focusedExplicitly] = useFocusedExplicitly();
    const focusElementMapRef = useActivityElementMapRef();
    const focus = useFocus();
    const focusByActivityKey = useFocusByActivityKey();
    const focusRelativeActivity = useFocusRelativeActivity();
    const getActivityByKey = useGetActivityByKey();
    const getKeyByActivityId = useGetKeyByActivityId();
    const localize = useLocalizer();
    const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';
    const rootElementRef = useRef<HTMLDivElement>(null);

    const focusedKeyRef = useValueRef(focusedKey);
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

    const [numRenderingActivities] = useNumRenderingActivities();

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
          const activityBoundingBoxElement = focusElementMapRef.current
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
      [focusElementMapRef, getKeyByActivityId, rootElementRef, scrollToBottomScrollTo]
    );

    const scrollToEnd = useCallback(
      () => scrollToBottomScrollToEnd({ behavior: 'smooth' }),
      [scrollToBottomScrollToEnd]
    );

    const scrollRelative = useCallback(
      ({ direction, displacement }: TranscriptScrollRelativeOptions) => {
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
    useRegisterScrollRelativeTranscript(scrollRelative);

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
        const activityElements = Array.from(focusElementMapRef.current.entries());
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
        focusElementMapRef,
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
              const focusElement = focusElementMapRef.current?.get(focusedKeyRef.current);
              const activityFocusTrapTarget: HTMLElement =
                focusElement?.querySelector('.webchat__basic-transcript__group-focus-target') ??
                focusElement?.querySelector('.webchat__basic-transcript__activity-focus-target');
              // TODO: review focus approach:
              // It is not clear how to handle focus without introducing something like context.
              // Ideally we would want a way to interact with focus outside of React
              // so it doesn't cause transcript re-renders while still having an ability
              // to scope activity-related handlers and data in a single place.
              activityFocusTrapTarget?.focus();
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
      [focusElementMapRef, focus, focusedKeyRef, focusRelativeActivity, terminatorRef]
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
      [focus, terminatorRef]
    );

    useRegisterFocusTranscript(useCallback(() => focusByActivityKey(undefined), [focusByActivityKey]));

    // When the focusing activity has changed, dispatch an event to observers of "useObserveTranscriptFocus".
    const dispatchTranscriptFocusByActivityKey = useDispatchTranscriptFocusByActivityKey();

    // Dispatch a "transcript focus" event based on user selection.
    // We should not dispatch "transcript focus" when a new activity come. Although the selection change, it is not initiated from the user.
    useMemo(
      () => dispatchTranscriptFocusByActivityKey(focusedExplicitly ? focusedKey : undefined),
      [dispatchTranscriptFocusByActivityKey, focusedKey, focusedExplicitly]
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

    const hasAnyChild = !!numRenderingActivities;

    return (
      <TranscriptFocusArea
        // Although Android TalkBack 12.1 does not support `aria-activedescendant`, when used, it become buggy and will narrate content twice.
        // We are disabling `aria-activedescendant` for Android. See <ActivityRow> for details.
        aria-activedescendant={android ? undefined : activeDescendantId}
        aria-label={transcriptAriaLabel}
        className={classNames('webchat__basic-transcript', rootClassName, (className || '') + '')}
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
        <LiveRegionTranscript activityElementMapRef={focusElementMapRef} />
        {hasAnyChild && <FocusRedirector redirectRef={terminatorRef} />}
        <InternalTranscriptScrollable onFocusFiller={handleFocusFiller}>
          {hasAnyChild && <ActivityTree />}
        </InternalTranscriptScrollable>
        {hasAnyChild && (
          <Fragment>
            <FocusRedirector redirectRef={rootElementRef} />
            <TranscriptFocusTerminator ref={terminatorRef} role="note" tabIndex={0} />
          </Fragment>
        )}
      </TranscriptFocusArea>
    );
  }
);

InternalTranscript.displayName = 'InternalTranscript';

type InternalTranscriptScrollableProps = Readonly<{
  children?: ReactNode;
  onFocusFiller: () => void;
}>;

// Separating high-frequency hooks to improve performance.
const InternalTranscriptScrollable = ({ children, onFocusFiller }: InternalTranscriptScrollableProps) => {
  const [{ activities: activitiesStyleSet }] = useStyleSet();
  const [sticky]: [boolean] = useSticky();
  const localize = useLocalizer();
  const markAllAsAcknowledged = useMarkAllAsAcknowledged();

  const prevSticky = usePrevious(sticky);
  const transcriptRoleDescription = localize('TRANSCRIPT_ARIA_ROLE_ALT');

  const stickyChangedToTrue = prevSticky !== sticky && sticky;

  useMemo(
    () =>
      stickyChangedToTrue &&
      // TODO: [P2] Both `markActivityKeyAsRead` and `markAllAsAcknowledged` hook are setters of useState.
      //       This means, in a render loop, we will be calling setter and will cause another re-render.
      //       This is not trivial but we should think if there is a way to avoid this.
      markAllAsAcknowledged(),
    [markAllAsAcknowledged, stickyChangedToTrue]
  );

  // We need to check if `children` is `false` or not.
  // If `children` is `false`, React.Children.count(children) will still return 1 (truthy).
  const hasAnyChild = !!children && !!React.Children.count(children);

  return (
    <React.Fragment>
      <ReactScrollToBottomPanel className="webchat__basic-transcript__scrollable">
        <div aria-hidden={true} className="webchat__basic-transcript__filler" onFocus={onFocusFiller} />
        {hasAnyChild && (
          <TranscriptActivityList
            aria-roledescription={transcriptRoleDescription}
            className={classNames(activitiesStyleSet + '', 'webchat__basic-transcript__transcript')}
            role="feed"
          >
            {children}
          </TranscriptActivityList>
        )}
        <BasicTypingIndicator />
      </ReactScrollToBottomPanel>
    </React.Fragment>
  );
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

type BasicTranscriptProps = Readonly<{
  className: string;
}>;

const BasicTranscript = ({ className = '' }: BasicTranscriptProps) => {
  const [{ stylesRoot }] = useStyleOptions();
  const [nonce] = useNonce();
  const activityElementMapRef = useActivityElementMapRef();
  const containerRef = useRef<HTMLDivElement>(null);
  const terminatorRef = useRef<HTMLDivElement>(null);

  const scroller = useScroller(activityElementMapRef);
  const styleOptions = useMemo(() => ({ stylesRoot }), [stylesRoot]);

  return (
    <ChatHistoryBox className={className}>
      <RenderingActivitiesComposer>
        <TranscriptFocusComposer containerRef={containerRef}>
          <ReactScrollToBottomComposer nonce={nonce} scroller={scroller} styleOptions={styleOptions}>
            <ChatHistoryToolbar>
              <ScrollToEndButton terminatorRef={terminatorRef} />
            </ChatHistoryToolbar>
            <GroupedRenderingActivitiesComposer>
              <InternalTranscript ref={containerRef} terminatorRef={terminatorRef} />
            </GroupedRenderingActivitiesComposer>
          </ReactScrollToBottomComposer>
        </TranscriptFocusComposer>
      </RenderingActivitiesComposer>
    </ChatHistoryBox>
  );
};

export default wrapWith(ChatHistoryDOMComposer)(memo(BasicTranscript));
export { type BasicTranscriptProps };
