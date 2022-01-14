/* eslint no-magic-numbers: ["error", { "ignore": [-1, 0, 1, 2, 5, 36] }] */

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
import type { DirectLineActivity } from 'botframework-webchat-core';
import type {
  FC,
  FocusEventHandler,
  KeyboardEventHandler,
  MouseEventHandler,
  MutableRefObject,
  PropsWithChildren,
  ReactNode,
  VFC
} from 'react';

import TranscriptFocusComposer from './providers/TranscriptFocus/TranscriptFocusComposer';
import useActiveDescendantId from './providers/TranscriptFocus/useActiveDescendantId';
import useComputeElementIdFromActivityKey from './providers/TranscriptFocus/useComputeElementIdFromActivityKey';
import useFocusByActivityKey from './providers/TranscriptFocus/useFocusByActivityKey';
import useFocusedActivityKey from './providers/TranscriptFocus/useFocusedActivityKey';
import useFocusRelativeActivity from './providers/TranscriptFocus/useFocusRelativeActivity';
import ActivityKeyerComposer from './providers/ActivityKeyer/ActivityKeyerComposer';
import ActivityTreeComposer from './providers/ActivityTree/ActivityTreeComposer';
// import useActiveDescendantId from './providers/ActiveDescendant/useActiveDescendantId';
// import useFocusActiveDescendant from './providers/ActiveDescendant/useFocusActiveDescendant';
// import useFocusContainer from './providers/ActiveDescendant/useFocusContainer';
import BasicTypingIndicator from './BasicTypingIndicator';
import Fade from './Utils/Fade';
import FocusRedirector from './Utils/FocusRedirector';
// import getActivityUniqueId from './Utils/getActivityUniqueId';
import getTabIndex from './Utils/TypeFocusSink/getTabIndex';
import inputtableKey from './Utils/TypeFocusSink/inputtableKey';
import isZeroOrPositive from './Utils/isZeroOrPositive';
import ScreenReaderActivity from './ScreenReaderActivity';
import ScreenReaderText from './ScreenReaderText';
// import scrollIntoViewWithBlockNearest from './Utils/scrollIntoViewWithBlockNearest';
import SpeakActivity from './Activity/Speak';
// TODO: [P*] Rename to "getTabbableElements".
import tabbableElements from './Utils/tabbableElements';
import useAcknowledgedActivity from './hooks/internal/useAcknowledgedActivity';
import useActivityTreeWithRenderer from './providers/ActivityTree/useActivityTreeWithRenderer';
import useDispatchScrollPosition from './hooks/internal/useDispatchScrollPosition';
import useDispatchTranscriptFocus from './hooks/internal/useDispatchTranscriptFocus';
import useFocus from './hooks/useFocus';
import useGetKeyByActivity from './providers/ActivityKeyer/useGetKeyByActivity';
import useObserveFocusVisible from './hooks/internal/useObserveFocusVisible';
import useRegisterFocusTranscript from './hooks/internal/useRegisterFocusTranscript';
import useRegisterScrollRelative from './hooks/internal/useRegisterScrollRelative';
import useRegisterScrollTo from './hooks/internal/useRegisterScrollTo';
import useRegisterScrollToEnd from './hooks/internal/useRegisterScrollToEnd';
import useStyleSet from './hooks/useStyleSet';
import useStyleToEmotionObject from './hooks/internal/useStyleToEmotionObject';
import useUniqueId from './hooks/internal/useUniqueId';
import useValueRef from './hooks/internal/useValueRef';

const {
  useActivities,
  useCreateActivityStatusRenderer,
  useCreateAvatarRenderer,
  useCreateScrollToEndButtonRenderer,
  useDirection,
  useLocalizer,
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

type ActivityElement = {
  activity: DirectLineActivity;
  element: HTMLElement;
  key: string;
};

type InternalTranscriptProps = {
  activityElementsRef: MutableRefObject<ActivityElement[]>;
  className?: string;
};

type RenderingElement = {
  activity: DirectLineActivity & {
    channelData?: {
      ['webchat:fallback-text']: string;
    };
  };
  callbackRef: (element: HTMLElement) => void;
  // focusActivity: () => void;
  // focusInside: () => void;
  // handleClick: MouseEventHandler<HTMLLIElement & Node>;
  // handleFocus: () => void;
  // handleKeyDown: KeyboardEventHandler<HTMLLIElement>;
  // handleMouseDownCapture: MouseEventHandler<HTMLLIElement>;
  hideTimestamp: boolean;
  key: string;
  liveRegionKey: string;
  renderActivity: Exclude<ReturnType<ActivityComponentFactory>, false>;
  renderActivityStatus: (props: { hideTimestamp?: boolean }) => ReactNode;
  renderAvatar: AvatarComponentFactory;
  role: string;
  // shouldSpeak: boolean;
  showCallout: boolean;
  // TODO: Consider rename this or remove this.
  supportScreenReader: boolean;
};

type ScrollBehavior = 'auto' | 'smooth';
type ScrollToOptions = { behavior?: ScrollBehavior };
type ScrollToPosition = { activityID?: string; scrollTop?: number };

// function uniqueID(): string {
//   return Date.now() + random().toString(36).substr(2);
// }

type ActivityRowProps = PropsWithChildren<{
  acknowledged: boolean;
  activity: DirectLineActivity;
  activityKey: string;
  // id: string;
  // onFocusInner: ({ activityKey: string }) => void;
  // onFocusSelf: ({ activityKey: string }) => void;
  shouldSpeak: boolean;
}>;

// function activityKeyToActivityElementId(key?: string): string {
//   return key && `webchat__basic-transcript__activity-rowid--${key}`;
// }

const ActivityRow = forwardRef<HTMLLIElement, ActivityRowProps>(
  (
    {
      acknowledged,
      activity,
      activityKey,
      children,
      // id,
      // onFocusInner, // Set active descendant only.
      // onFocusSelf, // Set active descendant and focus on transcript.
      shouldSpeak
    },
    ref
  ) => {
    const activityKeyRef = useValueRef<string>(activityKey);
    const [activeDescendantId] = useActiveDescendantId();
    const ariaLabelId = useMemo(() => `webchat__basic-transcript__activity-label--${activityKey}`, [activityKey]);
    const bodyRef = useRef<HTMLDivElement>();
    // const focusActiveDescendant = useFocusActiveDescendant();
    const focusByActivityKey = useFocusByActivityKey();
    const id = useComputeElementIdFromActivityKey()(activityKey);
    // const focusContainer = useFocusContainer();
    const localize = useLocalizer();
    // const onFocusInnerRef = useValueRef(onFocusInner);
    // const onFocusSelfRef = useValueRef(onFocusSelf);

    const focus = useCallback<(withFocus?: boolean) => void>(
      (withFocus?: boolean) => focusByActivityKey(activityKeyRef.current, withFocus),
      [activityKeyRef, focusByActivityKey]
    );

    const activityInteractiveAlt = localize('ACTIVITY_INTERACTIVE_LABEL_ALT'); // "Click to interact."
    const isActiveDescendant = id === activeDescendantId;

    const handleClick: MouseEventHandler = useCallback(
      ({ currentTarget, target }) => {
        // (Related to #4020)
        //
        // This is called while screen reader is running:
        //
        // 1. When scan mode is on (Windows Narrator) or in browse mode (NVDA), ENTER key is pressed, or;
        // 2. When scan mode is off (Windows Narrator) or in focus mode (NVDA), CAPSLOCK + ENTER is pressed
        //
        // Although `document.activeElement` (a.k.a. primary focus) is on the transcript,
        // when ENTER key is pressed with screen reader in scan mode, screen reader will
        // "do primary action", which ask the browser to send a `click` event to the
        // active descendant (a.k.a. focused activity).
        //
        // While outside of scan mode, this will also capture CAPSLOCK + ENTER,
        // which is a key combo for "do primary action" or "activates the current navigator object".
        //
        // We cannot capture plain ENTER key outside of scan mode here.
        // We can only capture it on `keydown` event fired to the transcript element.
        //
        // Also see https://github.com/nvaccess/nvda/issues/7898.

        if (
          // The followings are for Windows Narrator:
          // - When scan mode is on
          //   - Press ENTER will dispatch "click" event to the <li> element
          //   - This is called "Do primary action"
          target === currentTarget ||
          // The followings are for NVDA:
          // - When in browse mode (red border), and the red box is around the <ScreenReaderActivity>
          //   - The much simplified DOM tree: <li><article><p>...</p></article></li>
          //   - Press ENTER will dispatch `click` event
          //      - NVDA 2020.2 (buggy): In additional to ENTER, when navigating using UP/DOWN arrow keys, it dispatch "click" event to the <article> element
          //      - NVDA 2021.2: After press ENTER, it dispatch 2 `click` events. First to the <article> element, then to the element currently bordered in red (e.g. <p>)
          //   - Perhaps, we should add role="application" to container of Web Chat to disable browse mode, as we are not a web document and already offered a full-fledge navigation experience
          document.getElementById(currentTarget.getAttribute('aria-labelledby')).contains(target as HTMLElement)
        ) {
          // Focus on the first tabbable element inside the activity.
          tabbableElements(bodyRef.current)[0]?.focus();
        }
      },
      [bodyRef]
    );

    // Some inputs inside the activity is focused.
    // We don't need to set the focus on the transcript, just set the active descendant is fine.
    const handleFocus: FocusEventHandler = useCallback(() => focus(false), [focus]);

    const handleKeyDown: KeyboardEventHandler = useCallback(
      event => {
        if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();

          focus();
        }
      },
      [focus]
    );

    // For accessibility: when the user press up/down arrow keys, we put a visual focus indicator around the focused activity.
    // We should do the same for mouse, that is why we have the mouse down handler here.
    // We are doing it in event capture phase to prevent other components from stopping event propagation to us.
    const handleMouseDownCapture: MouseEventHandler = useCallback(
      ({ target }) => {
        const element = target as HTMLLIElement;
        const tabIndex = getTabIndex(element);

        // If mouse down on an element which is not tabbable, then, focus-self.
        if (typeof tabIndex !== 'number' || tabIndex < 0 || element.getAttribute('aria-disabled') === 'true') {
          focus(false);
        }
      },
      [focus]
    );

    // If "webchat:fallback-text" field is set to empty string, the activity must not be narrated.
    // TODO: [P*] Add test.
    const supportScreenReader = activity.channelData?.['webchat:fallback-text'] !== '';

    // TODO: [P*] Fix this.
    const isContentInteractive = false;

    const handleSentinelFocus: () => void = useCallback(() => focus(), [focus]);

    return (
      <li
        aria-labelledby={supportScreenReader ? ariaLabelId : undefined}
        className={classNames('webchat__basic-transcript__activity', {
          'webchat__basic-transcript__activity--acknowledged': acknowledged
        })}
        // "id" is required for aria-activedescendant.
        // eslint-disable-next-line react/forbid-dom-props
        id={id}
        // This is for capturing "do primary action" done by the screen reader.
        // With screen reader, will narrate "Press ENTER to interact". But in scan mode, ENTER means "do primary action".
        // If `onClick` is set, screen reader will send click event when "do primary action".
        // Related to #4020.
        onClick={handleClick}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        // When NVDA is in browse mode, using up/down arrow key to "browse" will dispatch "click" and "mousedown" events for <article> element (inside <ScreenReaderActivity>).
        onMouseDownCapture={handleMouseDownCapture}
        ref={ref}
      >
        {/* TODO: [P*] Fix double narration. */}
        {supportScreenReader && (
          <ScreenReaderActivity activity={activity} id={ariaLabelId} renderAttachments={false}>
            {!!isContentInteractive && <p>{activityInteractiveAlt}</p>}
          </ScreenReaderActivity>
        )}
        {/* TODO: [P*] Consider focus trap. */}
        <FocusRedirector className="webchat__basic-transcript__activity-sentinel" onFocus={handleSentinelFocus} />
        <div className="webchat__basic-transcript__activity-box" ref={bodyRef}>
          {children}
        </div>
        {shouldSpeak && <SpeakActivity activity={activity} />}
        <FocusRedirector className="webchat__basic-transcript__activity-sentinel" onFocus={handleSentinelFocus} />
        <div
          className={classNames('webchat__basic-transcript__activity-indicator', {
            'webchat__basic-transcript__activity-indicator--focus': isActiveDescendant
          })}
        />
      </li>
    );
  }
);

ActivityRow.defaultProps = {
  children: undefined
};

ActivityRow.propTypes = {
  acknowledged: PropTypes.bool.isRequired,
  activity: PropTypes.shape({
    channelData: PropTypes.shape({
      'webchat:fallback-text': PropTypes.string
    })
  }).isRequired,
  activityKey: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)]),
  shouldSpeak: PropTypes.bool.isRequired
};

// TODO: [P*] Add telemetry for computing how many re-render done so far.
const InternalTranscript = forwardRef<HTMLDivElement, InternalTranscriptProps>(
  ({ activityElementsRef, className }, ref) => {
    const [{ basicTranscript: basicTranscriptStyleSet }] = useStyleSet();
    const [
      { bubbleFromUserNubOffset, bubbleNubOffset, groupTimestamp, internalLiveRegionFadeAfter, showAvatarInGroup }
    ] = useStyleOptions();
    const [activities] = useActivities();
    const [activityWithRendererTree] = useActivityTreeWithRenderer();
    const [direction] = useDirection();
    // If "rawFocusedActivityKey" is undefined, that means the user did not select any active descendant (a.k.a. focused activity).
    // We should assume the last activity, if any, is the active descendant.
    // const [rawActiveDescendantId, setRawActiveDescendantId] = useActiveDescendantId();
    // const [rawFocusedActivityKey, setRawFocusedActivityKey] = useState<string>();
    // const focusActiveDescendant = useFocusActiveDescendant();
    // const focusContainer = useFocusContainer();
    const [activeDescendantId] = useActiveDescendantId();
    const [focusedActivityKey] = useFocusedActivityKey();
    const focusByActivityKey = useFocusByActivityKey();
    const focusRelativeActivity = useFocusRelativeActivity();
    const createActivityStatusRenderer = useCreateActivityStatusRenderer();
    const createAvatarRenderer = useCreateAvatarRenderer();
    const focus = useFocus();
    const getKeyByActivity = useGetKeyByActivity();
    const localize = useLocalizer();
    const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';
    const rootElementRef = useRef<HTMLDivElement>();
    const terminatorRef = useRef<HTMLDivElement>();
    // const activityInteractiveAlt = localize('ACTIVITY_INTERACTIVE_LABEL_ALT');
    const terminatorText = localize('TRANSCRIPT_TERMINATOR_TEXT');
    const transcriptAriaLabel = localize('TRANSCRIPT_ARIA_LABEL_ALT');
    const transcriptRoleDescription = localize('TRANSCRIPT_ARIA_ROLE_ALT');

    const focusedActivityKeyRef = useValueRef(focusedActivityKey);

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

    // const activitiesRef = useValueRef(activities);
    const hideAllTimestamps = groupTimestamp === false;

    // const scrollFocusedActivityIntoView = useCallback(() => {
    //   const { current: activityElements } = activityElementsRef;
    //   const { current: userFocusedActivityKey } = userFocusedActivityKeyRef;

    //   const activityElement = (
    //     activityElements.find(({ key }) => key === userFocusedActivityKey) ||
    //     activityElements[activityElements.length - 1]
    //   )?.element;

    //   // Don't scroll active descendant into view if the focus is already inside it.
    //   // Otherwise, given the focus is on the send box, clicking on any <input> inside the Adaptive Cards may cause the view to move.
    //   // This UX is not desirable because click should not cause scroll.
    //   if (activityElement && !activityElement.contains(document.activeElement)) {
    //     scrollIntoViewWithBlockNearest(activityElement);
    //   }
    // }, [activityElementsRef, userFocusedActivityKeyRef]);

    // Set the focusing activity because the user want to.
    // Since this is user-initiated action, we want to scroll the activity into view as well.
    // If we are blurring the focus (set it to `undefined`), then do not scroll to the bottom.
    // const setFocusedActivityKey = useCallback(
    //   (nextFocusedActivityKey?: string, shouldFocus: boolean = true) => {
    //     // TODO: [P*] This is being called too many times.
    //     focusByActivityKey(nextFocusedActivityKey, shouldFocus);
    //   },
    //   [focusByActivityKey]
    // );

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
            const renderActivityStatus = createActivityStatusRenderer({
              activity,
              nextVisibleActivity: undefined
            });

            const firstInSenderAndStatusGroup = !indexWithinSenderAndStatusGroup;
            const lastInSenderAndStatusGroup =
              indexWithinSenderAndStatusGroup === entriesWithSameSenderAndStatus.length - 1;

            const key: string = getKeyByActivity(activity);
            const baseAltText: string =
              typeof activity?.channelData?.['webchat:fallback-text'] === 'string'
                ? activity?.channelData?.['webchat:fallback-text']
                : activity?.channelData?.messageBack?.displayText || activity.text;

            // If "webchat:fallback-text" field is set to empty string, the activity must not be narrated.
            const supportScreenReader = activity?.channelData?.['webchat:fallback-text'] !== '';

            const {
              from: { role } = {}
            }: {
              from?: { role?: string };
            } = activity;

            const topSideNub = role === 'user' ? topSideUserNub : topSideBotNub;

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

            // const focusActivity = () => {
            //   setUserFocusedActivityKeyWithScroll(getKeyByActivity(activity));

            //   // IE11 need to manually focus on the transcript.
            //   rootElementRef.current?.focus();
            // };

            // Focus on the first tabbable element inside the activity.
            // This will be triggered by pressing ENTER while focusing on an interactive activity.
            // TODO: [P*] Can we remove this?
            // const focusInside = () => {
            //   const [firstTabbableElement] = tabbableElements(
            //     activityElementsRef.current.find(activityElement => activityElement.key === key)?.element
            //   ).filter(({ className }) => className !== 'webchat__basic-transcript__activity-sentinel');

            //   firstTabbableElement?.focus();
            // };

            renderingElements.push({
              activity,

              // After the element is mounted, set it to activityElementsRef.
              callbackRef: activityElement => {
                const entry = activityElementsRef.current.find(entry => entry.key === key);

                if (entry) {
                  entry.element = activityElement;
                }
              },

              // Calling this function will put the focus on the transcript and the activity.
              // focusActivity,

              // Calling this function will focus on the first tabbable element in the activity.
              // focusInside,

              // handleClick: event => {
              //   // (Related to #4020)
              //   //
              //   // This is called while screen reader is running:
              //   //
              //   // 1. When scan mode is on (Windows Narrator) or in browse mode (NVDA), ENTER key is pressed, or;
              //   // 2. When scan mode is off (Windows Narrator) or in focus mode (NVDA), CAPSLOCK + ENTER is pressed
              //   //
              //   // Although `document.activeElement` (a.k.a. primary focus) is on the transcript,
              //   // when ENTER key is pressed with screen reader in scan mode, screen reader will
              //   // "do primary action", which ask the browser to send a `click` event to the
              //   // active descendant (a.k.a. focused activity).
              //   //
              //   // While outside of scan mode, this will also capture CAPSLOCK + ENTER,
              //   // which is a key combo for "do primary action" or "activates the current navigator object".
              //   //
              //   // We cannot capture plain ENTER key outside of scan mode here.
              //   // We can only capture it on `keydown` event fired to the transcript element.
              //   //
              //   // Also see https://github.com/nvaccess/nvda/issues/7898.

              //   const { currentTarget, target } = event;

              //   // The followings are for Windows Narrator:
              //   // - When scan mode is on
              //   //   - Press ENTER will dispatch "click" event to the <li> element
              //   //   - This is called "Do primary action"
              //   if (target === currentTarget) {
              //     return focusInside();
              //   }

              //   // The followings are for NVDA:
              //   // - When in browse mode (red border), and the red box is around the <ScreenReaderActivity>
              //   //   - The much simplified DOM tree: <li><article><p>...</p></article></li>
              //   //   - Press ENTER will dispatch `click` event
              //   //      - NVDA 2020.2 (buggy): In additional to ENTER, when navigating using UP/DOWN arrow keys, it dispatch "click" event to the <article> element
              //   //      - NVDA 2021.2: After press ENTER, it dispatch 2 `click` events. First to the <article> element, then to the element currently bordered in red (e.g. <p>)
              //   //   - Perhaps, we should add role="application" to container of Web Chat to disable browse mode, as we are not a web document and already offered a full-fledge navigation experience
              //   if (
              //     document.getElementById(currentTarget.getAttribute('aria-labelledby')).contains(target as HTMLElement)
              //   ) {
              //     return focusInside();
              //   }
              // },

              // // When a child of the activity receives focus, notify the transcript to set the aria-activedescendant to this activity.
              // handleFocus: () => {
              //   setUserFocusedActivityKeyWithScroll(getKeyByActivity(activity));
              // },

              // handleKeyDown: event => {
              //   if (event.key === 'Escape') {
              //     event.preventDefault();
              //     event.stopPropagation();

              //     setUserFocusedActivityKeyWithScroll(getKeyByActivity(activity));
              //     rootElementRef.current?.focus();
              //   }
              // },

              // // For accessibility: when the user press up/down arrow keys, we put a visual focus indicator around the focused activity.
              // // We should do the same for mouse, that is why we have the click handler here.
              // // We are doing it in event capture phase to prevent other components from stopping event propagation to us.
              // handleMouseDownCapture: ({ target }) => {
              //   const element = target as HTMLLIElement;
              //   const tabIndex = getTabIndex(element);

              //   if (typeof tabIndex !== 'number' || tabIndex < 0 || element.getAttribute('aria-disabled') === 'true') {
              //     focusActivity();
              //   }
              // },

              // "hideTimestamp" is a render-time parameter for renderActivityStatus().
              // If true, it will hide the timestamp, but it will continue to show the
              // retry prompt. And show the screen reader version of the timestamp.
              hideTimestamp:
                hideAllTimestamps || indexWithinSenderAndStatusGroup !== entriesWithSameSenderAndStatus.length - 1,
              key,

              // When "liveRegionKey" changes or contents that made up the alt text changed, it will show up in the live region momentarily.
              liveRegionKey: key + '|' + baseAltText,
              renderActivity,
              renderActivityStatus,
              renderAvatar,
              role,

              // TODO: [P2] #2858 We should use core/definitions/speakingActivity for this predicate instead
              // shouldSpeak: activity.channelData?.speak,
              showCallout,
              supportScreenReader
            });
          });
        });
      });

      return renderingElements;
    }, [
      activityElementsRef,
      activityWithRendererTree,
      bubbleFromUserNubOffset,
      bubbleNubOffset,
      createActivityStatusRenderer,
      createAvatarRenderer,
      getKeyByActivity,
      hideAllTimestamps,
      // rootElementRef,
      // setUserFocusedActivityKeyWithScroll,
      showAvatarInGroup
    ]);

    // const renderingElementsRef = useValueRef(renderingElements);

    // Update activityElementRef with new sets of activity, while retaining the existing referencing element if exists.
    useMemo(() => {
      const { current: activityElements } = activityElementsRef;
      const nextActivityElements = [];

      activityWithRendererTree.forEach(entriesWithSameSender => {
        entriesWithSameSender.forEach(entriesWithSameSenderAndStatus => {
          entriesWithSameSenderAndStatus.forEach(({ activity }) => {
            const key = getKeyByActivity(activity);

            nextActivityElements.push({
              activity,
              element: activityElements.find(entry => entry.key === key)?.element,
              key
            });
          });
        });
      });

      activityElementsRef.current = nextActivityElements;
    }, [activityElementsRef, activityWithRendererTree, getKeyByActivity]);

    // const activeDescendantId =
    //   rawActiveDescendantId || activityKeyToActivityElementId(renderingElements[renderingElements.length - 1]?.key);

    // const focusedActivityKeyRef = useValueRef<string | undefined>(
    //   renderingElements.find(({ key }) => key === rawFocusedActivityKey)
    //     ? rawFocusedActivityKey
    //     : renderingElements[renderingElements.length - 1]?.key
    // );

    // TODO: [P*] Why should we want a getter function instead of the value?
    // `getFocusedActivityKey` is a getter function returning patched version of `userFocusedActivityKey`. The patch logic:
    //
    // 1. If `userFocusedActivityKey` is set and the activity is being rendered in the transcript, return the key;
    // 2. Otherwise, if the transcript is not empty, return the key of the last rendering activity;
    // 3. Otherwise, return falsy, indicating nothing is in the transcript and nothing can be selected.
    //
    // We are using a getter callback because this is a computed/derived value and we could get an updated version without re-rendering.
    // const getFocusedActivityKey = useCallback((): string | undefined => {
    //   const { current: renderingElements } = renderingElementsRef;
    //   const { current: userFocusedActivityKey } = rawUserFocusedActivityKeyRef;

    //   // Make sure the "userFocusedActivityKey" is pointing to an activity that is rendering in this current loop.
    //   if (userFocusedActivityKey && renderingElements.find(({ key }) => key === userFocusedActivityKey)) {
    //     return userFocusedActivityKey;
    //   }

    //   // Otherwise, assume the last rendered activity is focused.
    //   return renderingElements[renderingElements.length - 1]?.key;
    // }, [renderingElementsRef, rawUserFocusedActivityKeyRef]);

    const renderingActivities: DirectLineActivity[] = useMemo(
      () => renderingElements.map(({ activity }) => activity),
      [renderingElements]
    );

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
          const { current: rootElement } = rootElementRef;
          const { element: activityElement } =
            activityElementsRef.current.find(entry => entry.activity.id === activityId) || {};

          const scrollableElement = rootElement.querySelector('.webchat__basic-transcript__scrollable');

          if (scrollableElement && activityElement) {
            // ESLint conflict with TypeScript. The result of getClientRects() is not an array and should not be destructured.
            // eslint-disable-next-line prefer-destructuring
            const { height: activityElementHeight, y: activityElementY } = activityElement.getClientRects()[0];

            // ESLint conflict with TypeScript. The result of getClientRects() is not an array and should not be destructured.
            // eslint-disable-next-line prefer-destructuring
            const { height: scrollableHeight } = scrollableElement.getClientRects()[0];

            const activityElementOffsetTop = activityElementY + scrollableElement.scrollTop;

            const scrollTop = Math.min(
              activityElementOffsetTop,
              activityElementOffsetTop - scrollableHeight + activityElementHeight
            );

            scrollToBottomScrollTo(scrollTop, { behavior });
          }
        }
      },
      [activityElementsRef, rootElementRef, scrollToBottomScrollTo]
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
          nextScrollTop = scrollable.scrollTop + (direction === 'down' ? 1 : -1) * displacement;
        } else {
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

    const dispatchScrollPositionWithActivityId: (scrollPosition: ScrollToPosition) => void =
      useDispatchScrollPosition();

    const dispatchScrollPosition = useMemo(() => {
      if (!dispatchScrollPositionWithActivityId) {
        return;
      }

      return ({ scrollTop }: { scrollTop: number }) => {
        const { current: rootElement } = rootElementRef;

        if (!rootElement) {
          return;
        }

        const scrollableElement = rootElement.querySelector('.webchat__basic-transcript__scrollable');

        const offsetHeight = scrollableElement.getClientRects()[0]?.height;

        // Find the activity just above scroll view bottom.
        // If the scroll view is already on top, get the first activity.
        const entry = scrollableElement.scrollTop
          ? [...activityElementsRef.current]
              .reverse()
              .find(({ element }) => !!element && element.getClientRects()[0]?.y < offsetHeight)
          : activityElementsRef.current[0];

        const { activity } = entry || {};

        dispatchScrollPositionWithActivityId({ ...(activity ? { activityID: activity.id } : {}), scrollTop });
      };
    }, [activityElementsRef, dispatchScrollPositionWithActivityId, rootElementRef]);

    useObserveScrollPosition(dispatchScrollPosition);

    const [lastInteractedActivity]: [DirectLineActivity] = useAcknowledgedActivity();

    const indexOfLastInteractedActivity = activities.indexOf(lastInteractedActivity);

    // const focusRelativeActivity = useCallback(
    //   (delta?: number) => {
    //     const { current: renderingElements } = renderingElementsRef;

    //     if (isNaN(delta) || !renderingElements.length) {
    //       return focusByActivityKey(false);
    //     }

    //     const { current: focusedActivityKey } = focusedActivityKeyRef;
    //     // const focusedActivityKey = getFocusedActivityKey();

    //     const index = renderingElements.findIndex(({ key }) => key === focusedActivityKey);
    //     const nextIndex = ~index
    //       ? Math.max(0, Math.min(renderingElements.length - 1, index + delta))
    //       : renderingElements.length - 1;
    //     const nextFocusedActivity = renderingElements[+nextIndex];

    //     focusByActivityKey(nextFocusedActivity.key);
    //   },
    //   // [getFocusedActivityKey, renderingElementsRef, setUserFocusedActivityKeyWithScroll]
    //   [focusedActivityKeyRef, renderingElementsRef, focusByActivityKey]
    // );

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
            focusRelativeActivity(fromEndOfTranscriptIndicator ? 0 : -1);
            break;

          case 'End':
            focusRelativeActivity(Infinity);
            break;

          case 'Enter':
            // This is capturing plain ENTER.
            // When screen reader is not running, or screen reader is running outside of scan mode, the ENTER key will be captured here.
            if (!fromEndOfTranscriptIndicator) {
              const { current: focusedActivityKey } = focusedActivityKeyRef;
              // const focusedActivityKey = getFocusedActivityKey();

              // TODO: [P*] We could do better.
              const body: HTMLElement = activityElementsRef.current
                .find(({ key }) => key === focusedActivityKey)
                ?.element.querySelector('.webchat__basic-transcript__activity-box');

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
      // [focus, focusRelativeActivity, getFocusedActivityKey, terminatorRef]
      [activityElementsRef, focus, focusedActivityKeyRef, focusRelativeActivity, terminatorRef]
    );

    // TODO: [P*] Do we need this?
    const labelId = useUniqueId('webchat__basic-transcript__label');

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

    const focusContainer = useCallback(() => focusByActivityKey(undefined), [focusByActivityKey]);

    useRegisterFocusTranscript(focusContainer);

    const handleScrollToEnd = useCallback(
      ({ firstUnreadActivityKey }: { firstUnreadActivityKey?: string }) =>
        firstUnreadActivityKey && focusByActivityKey(firstUnreadActivityKey),
      [focusByActivityKey]
    );

    // When the focusing activity has changed, dispatch an event to observers of "useObserveTranscriptFocus".
    const dispatchTranscriptFocus: ({ activity }: { activity: DirectLineActivity }) => void =
      useDispatchTranscriptFocus();

    // Dispatch a "transcript focus" event based on user selection.
    // We should not dispatch "transcript focus" when a new activity come. Although the selection change, it is not initiated from the user.
    const focusedActivity = useMemo(
      () => renderingElements.find(({ key }) => key === focusedActivityKey)?.activity,
      [focusedActivityKey, renderingElements]
    );

    // TODO: [P*] Today, it will dispatch "transcript focus" if the activity object changed, but the focus does not.
    //       Should we only dispatch if the focused activity change?
    useMemo(() => dispatchTranscriptFocus?.({ activity: focusedActivity }), [dispatchTranscriptFocus, focusedActivity]);

    // This is required by IE11.
    // When the user clicks on and empty space (a.k.a. filler) in an empty transcript, IE11 says the focus is on the <div className="filler">,
    // despite the fact there are no "tabIndex" attributes set on the filler.
    // We need to artificially send the focus back to the transcript.
    const handleFocusFiller = useCallback(() => focusByActivityKey(undefined), [focusByActivityKey]);

    // When focus into the transcript using TAB/SHIFT-TAB, scroll the focused activity into view.
    const handleFocusVisible = useCallback(() => focusByActivityKey(undefined), [focusByActivityKey]);

    useObserveFocusVisible(rootElementRef, handleFocusVisible);

    return (
      <div
        // aria-activedescendant={renderingElements.find(({ key }) => key === focusedActivityKey)?.id}
        aria-activedescendant={activeDescendantId}
        aria-labelledby={labelId}
        className={classNames(
          'webchat__basic-transcript',
          basicTranscriptStyleSet + '',
          rootClassName,
          (className || '') + ''
        )}
        dir={direction}
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
        <ScreenReaderText id={labelId} text={transcriptAriaLabel} />
        {/* This <section> is for live region only. Content is made invisible through CSS. */}
        <section
          aria-atomic={false}
          aria-live="polite"
          aria-relevant="additions"
          aria-roledescription={transcriptRoleDescription}
          role="log"
        >
          {renderingElements
            .filter(({ supportScreenReader }) => supportScreenReader)
            .map(({ activity, liveRegionKey }) => (
              <Fade fadeAfter={internalLiveRegionFadeAfter} key={liveRegionKey}>
                {() => <ScreenReaderActivity activity={activity} />}
              </Fade>
            ))}
        </section>
        {/* TODO: [P2] Fix ESLint error `no-use-before-define` */}
        {/* eslint-disable-next-line @typescript-eslint/no-use-before-define */}
        <InternalTranscriptScrollable
          activities={renderingActivities}
          onFocusFiller={handleFocusFiller}
          onScrollToEnd={handleScrollToEnd}
          terminatorRef={terminatorRef}
        >
          {renderingElements.map(
            (
              {
                activity,
                callbackRef,
                // focusActivity,
                // handleClick,
                // handleFocus,
                // handleKeyDown,
                // handleMouseDownCapture,
                hideTimestamp,
                // id,
                key,
                renderActivity,
                renderActivityStatus,
                renderAvatar,
                // role,
                // shouldSpeak,
                showCallout
                // supportScreenReader
              },
              index
              // TODO: [P*] Fix this.
              // eslint-disable-next-line arrow-body-style
            ) => {
              // const { element } = activityElementsRef.current.find(entry => entry.activity === activity) || {};

              // TODO: [P*] Fix this.
              // const isContentInteractive = !!(element
              //   ? tabbableElements(element.querySelector('.webchat__basic-transcript__activity-box')).length
              //   : 0);

              return (
                <ActivityRow
                  acknowledged={index <= indexOfLastInteractedActivity}
                  activity={activity}
                  activityKey={key}
                  // id={`webchat__basic-transcript__activity--${key}`}
                  key={key}
                  // onFocusInner={handleActivityFocusInner}
                  // onFocusSelf={handleActivityFocusSelf}
                  ref={callbackRef}
                  // TODO: [P2] #2858 We should use core/definitions/speakingActivity for this predicate instead
                  shouldSpeak={activity.channelData?.speak}
                >
                  {renderActivity({
                    hideTimestamp,
                    renderActivityStatus,
                    renderAvatar,
                    showCallout
                  })}
                </ActivityRow>
              );

              // return (
              //   <li
              //     aria-labelledby={ariaLabelID}
              //     className={classNames('webchat__basic-transcript__activity', {
              //       'webchat__basic-transcript__activity--acknowledged': index <= indexOfLastInteractedActivity,
              //       'webchat__basic-transcript__activity--from-bot': role !== 'user',
              //       'webchat__basic-transcript__activity--from-user': role === 'user'
              //     })}
              //     // Set "id" is required for accessibility active descendant feature.
              //     /* eslint-disable-next-line react/forbid-dom-props */
              //     id={isActiveDescendant ? activeDescendantElementId : undefined}
              //     key={key}
              //     // This is for capturing "do primary action" done by the screen reader.
              //     // With screen reader, will narrate "Press ENTER to interact". But in scan mode, ENTER means "do primary action".
              //     // If `onClick` is set, screen reader will send click event when "do primary action".
              //     // Related to #4020.
              //     onClick={handleClick}
              //     onFocus={handleFocus}
              //     onKeyDown={handleKeyDown}
              //     // When NVDA is in browse mode, using up/down arrow key to "browse" will dispatch "click" and "mousedown" events for <article> element (inside <ScreenReaderActivity>).
              //     onMouseDownCapture={handleMouseDownCapture}
              //     ref={callbackRef}
              //   >
              //     {supportScreenReader && (
              //       <ScreenReaderActivity activity={activity} id={ariaLabelID} renderAttachments={false}>
              //         {!!isContentInteractive && <p>{activityInteractiveAlt}</p>}
              //       </ScreenReaderActivity>
              //     )}
              //     <FocusRedirector
              //       className="webchat__basic-transcript__activity-sentinel"
              //       onFocus={focusActivity}
              //       redirectRef={rootElementRef}
              //     />
              //     <div className="webchat__basic-transcript__activity-box">
              //       {renderActivity({
              //         hideTimestamp,
              //         renderActivityStatus,
              //         renderAvatar,
              //         showCallout
              //       })}
              //     </div>
              //     {shouldSpeak && <SpeakActivity activity={activity} />}
              //     <FocusRedirector
              //       className="webchat__basic-transcript__activity-sentinel"
              //       onFocus={focusActivity}
              //       redirectRef={rootElementRef}
              //     />
              //     <div
              //       className={classNames('webchat__basic-transcript__activity-indicator', {
              //         'webchat__basic-transcript__activity-indicator--first': !index,
              //         'webchat__basic-transcript__activity-indicator--focus': isActiveDescendant
              //       })}
              //     />
              //   </li>
              // );
            }
          )}
        </InternalTranscriptScrollable>
        {!!renderingElements.length && (
          <Fragment>
            <FocusRedirector className="webchat__basic-transcript__sentinel" redirectRef={rootElementRef} />
            <div className="webchat__basic-transcript__terminator" ref={terminatorRef} tabIndex={0}>
              <div className="webchat__basic-transcript__terminator-body">
                <div className="webchat__basic-transcript__terminator-text">{terminatorText}</div>
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
  activityElementsRef: PropTypes.shape({
    current: PropTypes.array.isRequired
  }).isRequired,
  className: PropTypes.string
};

type InternalScreenReaderTranscriptProps = {
  renderingElements: RenderingElement[];
};

const InternalScreenReaderTranscript: VFC<InternalScreenReaderTranscriptProps> = ({ renderingElements }) => {
  const localize = useLocalizer();
  const [internalLiveRegionFadeAfter] = useStyleOptions();

  const transcriptRoleDescription = localize('TRANSCRIPT_ARIA_ROLE_ALT');

  return (
    <section
      aria-atomic={false}
      aria-live="polite"
      aria-relevant="additions"
      aria-roledescription={transcriptRoleDescription}
      role="log"
    >
      {renderingElements.map(({ activity, liveRegionKey }) => (
        <Fade fadeAfter={internalLiveRegionFadeAfter} key={liveRegionKey}>
          {() => <ScreenReaderActivity activity={activity} />}
        </Fade>
      ))}
    </section>
  );
};

InternalScreenReaderTranscript.propTypes = {
  // PropTypes cannot validate precisely with its TypeScript counterpart.
  // @ts-ignore
  renderingElements: PropTypes.arrayOf(
    PropTypes.shape({
      activity: PropTypes.any,
      liveRegionKey: PropTypes.string
    })
  ).isRequired
};

type InternalTranscriptScrollableProps = {
  activities: DirectLineActivity[];
  children?: ReactNode;
  onFocusFiller: () => void;
  onScrollToEnd: (event: { firstUnreadActivityKey?: string }) => void;
  terminatorRef: MutableRefObject<HTMLDivElement>;
};

// Separating high-frequency hooks to improve performance.
const InternalTranscriptScrollable: FC<InternalTranscriptScrollableProps> = ({
  activities,
  children,
  onFocusFiller,
  onScrollToEnd,
  terminatorRef
}) => {
  const [{ activities: activitiesStyleSet }] = useStyleSet();
  const [animatingToEnd]: [boolean] = useAnimatingToEnd();
  const [atEnd]: [boolean] = useAtEnd();
  const [sticky]: [boolean] = useSticky();
  const [styleOptions] = useStyleOptions();
  const getKeyByActivity = useGetKeyByActivity();
  const lastVisibleActivityKey = getKeyByActivity(activities[activities.length - 1]); // Activity ID of the last visible activity in the list.
  const localize = useLocalizer();
  const scrollToEnd: (options?: ScrollToOptions) => void = useScrollToEnd();

  const lastReadActivityKeyRef = useRef(lastVisibleActivityKey);
  const transcriptRoleDescription = localize('TRANSCRIPT_ARIA_ROLE_ALT');

  const handleScrollToEndButtonClick = useCallback(() => {
    scrollToEnd({ behavior: 'smooth' });

    // After the "New message" button is clicked, focus on the first unread activity.
    const index = activities.findIndex(({ id }) => id === lastReadActivityKeyRef.current);

    if (~index) {
      const firstUnreadActivity = activities[index + 1];

      return onScrollToEnd({ firstUnreadActivityKey: firstUnreadActivity && getKeyByActivity(firstUnreadActivity) });
    }

    // If no unread activity, send the focus to the terminator block.
    terminatorRef.current?.focus();
  }, [activities, getKeyByActivity, lastReadActivityKeyRef, onScrollToEnd, scrollToEnd, terminatorRef]);

  if (atEnd || sticky) {
    // If it is sticky or at the end, the user is at the bottom of the transcript, everything is read.
    // So mark the activity ID as read.
    lastReadActivityKeyRef.current = lastVisibleActivityKey;
  }

  const renderScrollToEndButton = useCreateScrollToEndButtonRenderer()({
    atEnd: animatingToEnd || atEnd || sticky,
    styleOptions,

    // Unread means:
    // 1. Last read is not the last one in the transcript, and;
    // 2. Last read is still in the transcript.
    unread:
      lastVisibleActivityKey !== lastReadActivityKeyRef.current &&
      !!~activities.findIndex(activity => getKeyByActivity(activity) === lastReadActivityKeyRef.current)
  });

  return (
    <React.Fragment>
      {renderScrollToEndButton && renderScrollToEndButton({ onClick: handleScrollToEndButtonClick })}
      {!!React.Children.count(children) && (
        <FocusRedirector className="webchat__basic-transcript__sentinel" redirectRef={terminatorRef} />
      )}
      <ReactScrollToBottomPanel className="webchat__basic-transcript__scrollable">
        <div aria-hidden={true} className="webchat__basic-transcript__filler" onFocus={onFocusFiller} />
        <ul
          aria-roledescription={transcriptRoleDescription}
          className={classNames(activitiesStyleSet + '', 'webchat__basic-transcript__transcript')}
          role="list"
        >
          {children}
        </ul>
        <BasicTypingIndicator />
      </ReactScrollToBottomPanel>
    </React.Fragment>
  );
};

InternalTranscriptScrollable.propTypes = {
  activities: PropTypes.array.isRequired,
  children: PropTypes.any.isRequired,
  onFocusFiller: PropTypes.func.isRequired,
  onScrollToEnd: PropTypes.func.isRequired,
  terminatorRef: PropTypes.any.isRequired
};

type Scroller = ({ offsetHeight, scrollTop }: { offsetHeight: number; scrollTop: number }) => number;

type SetScrollProps = {
  activityElementsRef: MutableRefObject<ActivityElement[]>;
  scrollerRef: MutableRefObject<Scroller>;
};

const SetScroller: VFC<SetScrollProps> = ({ activityElementsRef, scrollerRef }) => {
  const [
    { autoScrollSnapOnActivity, autoScrollSnapOnActivityOffset, autoScrollSnapOnPage, autoScrollSnapOnPageOffset }
  ] = useStyleOptions();
  const [activities] = useActivities();
  const [lastAcknowledgedActivity] = useAcknowledgedActivity();

  const activitiesRef = useValueRef(activities);
  const lastAcknowledgedActivityRef = useValueRef(lastAcknowledgedActivity);

  // TODO: What is the difference between "scroller" vs. "useObserveScrollPosition"?
  //       If they serve same purpose, should we combine them?

  scrollerRef.current = useCallback(
    ({ offsetHeight, scrollTop }) => {
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
        const { current: activities } = activitiesRef;
        const { current: activityElements } = activityElementsRef;
        const { current: lastAcknowledgedActivity } = lastAcknowledgedActivityRef;
        const values: number[] = [];

        const lastAcknowledgedActivityIndex = activities.indexOf(lastAcknowledgedActivity);

        if (~lastAcknowledgedActivityIndex) {
          // The activity that we acknowledged could be not rendered, such as post back activity.
          // When calculating scroll snap, we can only base on the first unacknowledged-and-rendering activity.
          let firstUnacknowledgedActivityElementIndex = -1;

          for (let index = lastAcknowledgedActivityIndex + 1, { length } = activities; index < length; index++) {
            const activity = activities[+index];
            const activityElementIndex = activityElements.findIndex(entry => entry.activity === activity);

            if (~activityElementIndex) {
              firstUnacknowledgedActivityElementIndex = activityElementIndex;
              break;
            }
          }

          if (~firstUnacknowledgedActivityElementIndex) {
            if (patchedAutoScrollSnapOnActivity) {
              // Gets the activity element which we should snap to.
              const { element: nthUnacknowledgedActivityElement } =
                activityElements[firstUnacknowledgedActivityElementIndex + patchedAutoScrollSnapOnActivity - 1];

              if (nthUnacknowledgedActivityElement) {
                values.push(
                  nthUnacknowledgedActivityElement.offsetTop +
                    nthUnacknowledgedActivityElement.offsetHeight -
                    offsetHeight -
                    scrollTop +
                    patchedAutoScrollSnapOnActivityOffset
                );
              }
            }

            if (patchedAutoScrollSnapOnPage) {
              const { element: firstUnacknowledgedActivityElement } =
                activityElements[+firstUnacknowledgedActivityElementIndex];

              values.push(
                firstUnacknowledgedActivityElement.offsetTop -
                  scrollTop -
                  offsetHeight * (1 - patchedAutoScrollSnapOnPage) +
                  patchedAutoScrollSnapOnPageOffset
              );
            }
          }
        }

        return values.reduce((minValue, value) => Math.min(minValue, value), Infinity);
      }

      return Infinity;
    },
    [
      activitiesRef,
      activityElementsRef,
      autoScrollSnapOnActivity,
      autoScrollSnapOnActivityOffset,
      autoScrollSnapOnPage,
      autoScrollSnapOnPageOffset,
      lastAcknowledgedActivityRef
    ]
  );

  return null;
};

type BasicTranscriptProps = {
  className?: string;
};

const BasicTranscript: VFC<BasicTranscriptProps> = ({ className }) => {
  const activityElementsRef = useRef<ActivityElement[]>([]);
  const containerRef = useRef<HTMLDivElement>();
  const scrollerRef = useRef<Scroller>(() => Infinity);

  const scroller = useCallback<Scroller>((...args) => scrollerRef.current(...args), [scrollerRef]);

  return (
    <ReactScrollToBottomComposer scroller={scroller}>
      <SetScroller activityElementsRef={activityElementsRef} scrollerRef={scrollerRef} />
      <ActivityKeyerComposer>
        <ActivityTreeComposer>
          <TranscriptFocusComposer containerRef={containerRef}>
            <InternalTranscript activityElementsRef={activityElementsRef} className={className} ref={containerRef} />
          </TranscriptFocusComposer>
        </ActivityTreeComposer>
      </ActivityKeyerComposer>
    </ReactScrollToBottomComposer>
  );
};

BasicTranscript.defaultProps = {
  className: ''
};

BasicTranscript.propTypes = {
  className: PropTypes.string
};

export default BasicTranscript;
