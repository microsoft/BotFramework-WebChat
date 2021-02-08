/* eslint no-magic-numbers: ["error", { "ignore": [-1, 0, 1] }] */

import { hooks } from 'botframework-webchat-api';
import {
  Composer as ReactScrollToBottomComposer,
  Panel as ReactScrollToBottomPanel,
  useAnimatingToEnd,
  useObserveScrollPosition,
  useScrollTo,
  useScrollToEnd,
  useSticky
} from 'react-scroll-to-bottom';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import random from 'math-random';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import BasicTypingIndicator from './BasicTypingIndicator';
import Fade from './Utils/Fade';
import firstTabbableDescendant from './Utils/firstTabbableDescendant';
import FocusRedirector from './Utils/FocusRedirector';
import getActivityUniqueId from './Utils/getActivityUniqueId';
import inputtableKey from './Utils/TypeFocusSink/inputtableKey';
import intersectionOf from './Utils/intersectionOf';
import isZeroOrPositive from './Utils/isZeroOrPositive';
import removeInline from './Utils/removeInline';
import ScreenReaderActivity from './ScreenReaderActivity';
import ScreenReaderText from './ScreenReaderText';
import ScrollToEndButton from './Activity/ScrollToEndButton';
import SpeakActivity from './Activity/Speak';
import tabbableElements from './Utils/tabbableElements';
import useAcknowledgedActivity from './hooks/internal/useAcknowledgedActivity';
import useDispatchScrollPosition from './hooks/internal/useDispatchScrollPosition';
import useFocus from './hooks/useFocus';
import useMemoize from './hooks/internal/useMemoize';
import useRegisterScrollRelative from './hooks/internal/useRegisterScrollRelative';
import useRegisterScrollTo from './hooks/internal/useRegisterScrollTo';
import useRegisterScrollToEnd from './hooks/internal/useRegisterScrollToEnd';
import useStyleSet from './hooks/useStyleSet';
import useStyleToEmotionObject from './hooks/internal/useStyleToEmotionObject';
import useUniqueId from './hooks/internal/useUniqueId';
import useRegisterFocusTranscript from './hooks/internal/useRegisterFocusTranscript';

const {
  useActivities,
  useCreateActivityRenderer,
  useCreateActivityStatusRenderer,
  useCreateAvatarRenderer,
  useDirection,
  useDisabled,
  useGroupActivities,
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

function nextSiblingAll(element) {
  const {
    parentNode: { children }
  } = element;

  const elementIndex = [].indexOf.call(children, element);

  return [].slice.call(children, elementIndex + 1);
}

function validateAllActivitiesTagged(activities, bins) {
  return activities.every(activity => bins.some(bin => bin.includes(activity)));
}

const InternalTranscript = ({ activityElementsRef, className }) => {
  const [{ basicTranscript: basicTranscriptStyleSet }] = useStyleSet();
  const [
    { bubbleFromUserNubOffset, bubbleNubOffset, groupTimestamp, internalLiveRegionFadeAfter, showAvatarInGroup }
  ] = useStyleOptions();
  const [activities] = useActivities();
  const [direction] = useDirection();
  const [disabled] = useDisabled();
  const [activeActivityKey, setActiveActivityKey] = useState();
  const focus = useFocus();
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';
  const rootElementRef = useRef();
  const terminatorRef = useRef();

  const createActivityRenderer = useCreateActivityRenderer();
  const createActivityStatusRenderer = useCreateActivityStatusRenderer();
  const createAvatarRenderer = useCreateAvatarRenderer();
  const groupActivities = useGroupActivities();
  const hideAllTimestamps = groupTimestamp === false;
  const localize = useLocalizer();

  const activityAriaLabel = localize('ACTIVITY_ARIA_LABEL_ALT');
  const transcriptRoleDescription = localize('TRANSCRIPT_ARIA_ROLE_ALT');

  // TODO: [P0] We are currently using the TRANSCRIPT_ARIA_ROLE_ALT instead, because the translation of TRANSCRIPT_ARIA_LABEL_ALT may not arrive on time.
  // const transcriptAriaLabel = localize('TRANSCRIPT_ARIA_LABEL_ALT');
  const transcriptAriaLabel = localize('TRANSCRIPT_ARIA_ROLE_ALT');

  // Gets renderer for every activity.
  // Activities that are not visible will return a falsy renderer.

  // Converted from createActivityRenderer({ activity, nextVisibleActivity }) to createActivityRenderer(activity, nextVisibleActivity).
  // This is for the memoization function to cache the arguments. Memoizer can only cache literal arguments.
  const createActivityRendererWithLiteralArgs = useCallback(
    (activity, nextVisibleActivity) => createActivityRenderer({ activity, nextVisibleActivity }),
    [createActivityRenderer]
  );

  // Create a memoized context of the createActivityRenderer function.
  const activitiesWithRenderer = useMemoize(
    createActivityRendererWithLiteralArgs,
    createActivityRendererWithLiteralArgsMemoized => {
      // All calls to createActivityRendererWithLiteralArgsMemoized() in this function will be memoized (LRU = 1).
      // In the next render cycle, calls to createActivityRendererWithLiteralArgsMemoized() might return the memoized result instead.
      // This is an improvement to React useMemo(), because it only allows 1 memoization.
      // useMemoize() allows any number of memoization.

      const activitiesWithRenderer = [];
      let nextVisibleActivity;

      for (let index = activities.length - 1; index >= 0; index--) {
        const activity = activities[index];
        const renderActivity = createActivityRendererWithLiteralArgsMemoized(activity, nextVisibleActivity);

        if (renderActivity) {
          activitiesWithRenderer.splice(0, 0, {
            activity,
            renderActivity
          });

          nextVisibleActivity = activity;
        }
      }

      return activitiesWithRenderer;
    },
    [activities]
  );

  const visibleActivities = useMemo(() => activitiesWithRenderer.map(({ activity }) => activity), [
    activitiesWithRenderer
  ]);

  // Tag activities based on types.
  // The default implementation tag into 2 types: sender and status.

  const { activitiesGroupBySender, activitiesGroupByStatus } = useMemo(() => {
    const { sender: activitiesGroupBySender, status: activitiesGroupByStatus } = groupActivities({
      activities: visibleActivities
    });

    if (!validateAllActivitiesTagged(visibleActivities, activitiesGroupBySender)) {
      console.warn(
        'botframework-webchat: Not every activities are grouped in the "sender" property. Please fix "groupActivitiesMiddleware" and group every activities.'
      );
    }

    if (!validateAllActivitiesTagged(visibleActivities, activitiesGroupByStatus)) {
      console.warn(
        'botframework-webchat: Not every activities are grouped in the "status" property. Please fix "groupActivitiesMiddleware" and group every activities.'
      );
    }

    return {
      activitiesGroupBySender,
      activitiesGroupByStatus
    };
  }, [groupActivities, visibleActivities]);

  // Create a tree of activities with 2 dimensions: sender, followed by status.

  const activityTree = useMemo(() => {
    const visibleActivitiesPendingGrouping = [...visibleActivities];
    const activityTree = [];

    while (visibleActivitiesPendingGrouping.length) {
      const [activity] = visibleActivitiesPendingGrouping;
      const senderTree = [];
      const activitiesWithSameSender = activitiesGroupBySender.find(activities => activities.includes(activity));

      activityTree.push(senderTree);

      activitiesWithSameSender.forEach(activity => {
        const activitiesWithSameStatus = activitiesGroupByStatus.find(activities => activities.includes(activity));

        const activitiesWithSameSenderAndStatus = intersectionOf(
          visibleActivitiesPendingGrouping,
          activitiesWithSameSender,
          activitiesWithSameStatus
        );

        if (activitiesWithSameSenderAndStatus.length) {
          senderTree.push(activitiesWithSameSenderAndStatus);
          removeInline(visibleActivitiesPendingGrouping, ...activitiesWithSameSenderAndStatus);
        }
      });
    }

    // Assertion: All activities in visibleActivities, must be assigned to the activityTree
    if (
      !visibleActivities.every(activity =>
        activityTree.some(activitiesWithSameSender =>
          activitiesWithSameSender.some(activitiesWithSameSenderAndStatus =>
            activitiesWithSameSenderAndStatus.includes(activity)
          )
        )
      )
    ) {
      console.warn('botframework-webchat internal: Not all visible activities are grouped in the activityTree.', {
        visibleActivities,
        activityTree
      });
    }

    return activityTree;
  }, [activitiesGroupBySender, activitiesGroupByStatus, visibleActivities]);

  // Flatten the tree back into an array with information related to rendering.

  const renderingElements = useMemo(() => {
    const renderingElements = [];
    const topSideBotNub = isZeroOrPositive(bubbleNubOffset);
    const topSideUserNub = isZeroOrPositive(bubbleFromUserNubOffset);

    activityTree.forEach(activitiesWithSameSender => {
      const [[firstActivity]] = activitiesWithSameSender;
      const renderAvatar = createAvatarRenderer({ activity: firstActivity });

      activitiesWithSameSender.forEach((activitiesWithSameSenderAndStatus, indexWithinSenderGroup) => {
        const firstInSenderGroup = !indexWithinSenderGroup;
        const lastInSenderGroup = indexWithinSenderGroup === activitiesWithSameSender.length - 1;

        activitiesWithSameSenderAndStatus.forEach((activity, indexWithinSenderAndStatusGroup) => {
          // We only show the timestamp at the end of the sender group. But we always show the "Send failed, retry" prompt.
          const renderActivityStatus = createActivityStatusRenderer({
            activity
          });

          const firstInSenderAndStatusGroup = !indexWithinSenderAndStatusGroup;
          const lastInSenderAndStatusGroup =
            indexWithinSenderAndStatusGroup === activitiesWithSameSenderAndStatus.length - 1;

          const { renderActivity } = activitiesWithRenderer.find(entry => entry.activity === activity);
          const key = getActivityUniqueId(activity) || renderingElements.length;
          const {
            channelData: { messageBack: { displayText: messageBackDisplayText } = {} } = {},
            from: { role },
            text
          } = activity;

          const topSideNub = role === 'user' ? topSideUserNub : topSideBotNub;

          let showCallout;

          // Depends on different "showAvatarInGroup" setting, we will show the avatar in different positions.
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
              const entry = activityElementsRef.current.find(({ activityID }) => activityID === activity.id);

              if (entry) {
                entry.element = activityElement;
              }
            },

            // For accessibility: when the user press up/down arrow keys, we put a visual focus indicator around the activated activity.
            // We should do the same for mouse, that is why we have the click handler here.
            // We are doing it in event capture phase to prevent other components from stopping event propagation to us.
            handleFocus: () => setActiveActivityKey(getActivityUniqueId(activity)),
            handleKeyDown: event => {
              if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();

                setActiveActivityKey(getActivityUniqueId(activity));

                const { current } = rootElementRef;

                current && current.focus();
              }
            },

            // "hideTimestamp" is a render-time parameter for renderActivityStatus().
            // If true, it will hide the timestamp, but it will continue to show the
            // retry prompt. And show the screen reader version of the timestamp.
            hideTimestamp:
              hideAllTimestamps || indexWithinSenderAndStatusGroup !== activitiesWithSameSenderAndStatus.length - 1,
            key,

            // When "liveRegionKey" changes, it will show up in the live region momentarily.
            liveRegionKey: key + '|' + (messageBackDisplayText || text),
            renderActivity,
            renderActivityStatus,
            renderAvatar,
            role,

            // TODO: [P2] #2858 We should use core/definitions/speakingActivity for this predicate instead
            shouldSpeak: activity.channelData && activity.channelData.speak,
            showCallout
          });
        });
      });
    });

    const { current: activityElements } = activityElementsRef;

    // Update activityElementRef with new sets of activity, while retaining the existing referencing element if exists.
    activityElementsRef.current = renderingElements.map(({ activity, activity: { id }, elementId, key }) => {
      const existingEntry = activityElements.find(entry => entry.key === key);

      return {
        activity,
        activityID: id,
        element: existingEntry && existingEntry.element,
        elementId,
        key
      };
    });

    // There must be one "active" (a.k.a. aria-activedescendant) designated. We default it to the last one.
    if (!renderingElements.find(({ active }) => active)) {
      const lastElement = renderingElements[renderingElements.length - 1];

      if (lastElement) {
        lastElement.active = true;
      }
    }

    return renderingElements;
  }, [
    activitiesWithRenderer,
    activityElementsRef,
    activityTree,
    bubbleFromUserNubOffset,
    bubbleNubOffset,
    createActivityStatusRenderer,
    createAvatarRenderer,
    hideAllTimestamps,
    showAvatarInGroup
  ]);

  const renderingActivities = useMemo(() => renderingElements.map(({ activity }) => activity), [renderingElements]);

  const scrollToBottomScrollTo = useScrollTo();
  const scrollToBottomScrollToEnd = useScrollToEnd();

  const scrollTo = useCallback(
    (position, { behavior = 'auto' } = {}) => {
      if (!position) {
        throw new Error(
          'botframework-webchat: First argument passed to "useScrollTo" must be a ScrollPosition object.'
        );
      }

      const { activityID, scrollTop } = position;

      if (typeof scrollTop !== 'undefined') {
        scrollToBottomScrollTo(scrollTop, { behavior });
      } else if (typeof activityID !== 'undefined') {
        const { current: rootElement } = rootElementRef;
        const { element: activityElement } =
          activityElementsRef.current.find(entry => entry.activityID === activityID) || {};

        const scrollableElement = rootElement.querySelector('.webchat__basic-transcript__scrollable');

        if (scrollableElement && activityElement) {
          const [{ height: activityElementHeight, y: activityElementY }] = activityElement.getClientRects();
          const [{ height: scrollableHeight }] = scrollableElement.getClientRects();

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

  const scrollRelative = useCallback(
    direction => {
      const { current: rootElement } = rootElementRef;

      if (!rootElement) {
        return;
      }

      const scrollable = rootElement.querySelector('.webchat__basic-transcript__scrollable');

      scrollTo(
        {
          scrollTop: scrollable.scrollTop + (direction === 'down' ? 1 : -1) * scrollable.offsetHeight
        },
        { behavior: 'smooth' }
      );
    },
    [rootElementRef, scrollTo]
  );

  // Since there could be multiple instances of <BasicTranscript> inside the <Composer>, when the developer calls `scrollXXX`, we need to call it on all instances.
  // We call `useRegisterScrollXXX` to register a callback function, the `useScrollXXX` will multiplex the call into each instance of <BasicTranscript>.
  useRegisterScrollTo(scrollTo);
  useRegisterScrollToEnd(scrollToBottomScrollToEnd);
  useRegisterScrollRelative(scrollRelative);

  const dispatchScrollPosition = useDispatchScrollPosition();
  const patchedDispatchScrollPosition = useMemo(() => {
    if (!dispatchScrollPosition) {
      return;
    }

    return ({ scrollTop }) => {
      const { current: rootElement } = rootElementRef;

      if (!rootElement) {
        return;
      }

      const scrollableElement = rootElement.querySelector('.webchat__basic-transcript__scrollable');

      const [{ height: offsetHeight } = {}] = scrollableElement.getClientRects();

      // Find the activity just above scroll view bottom.
      // If the scroll view is already on top, get the first activity.
      const entry = scrollableElement.scrollTop
        ? [...activityElementsRef.current].reverse().find(({ element }) => {
            if (!element) {
              return false;
            }

            const [{ y } = {}] = element.getClientRects();

            return y < offsetHeight;
          })
        : activityElementsRef.current[0];

      const { activityID } = entry || {};

      dispatchScrollPosition({ ...(activityID ? { activityID } : {}), scrollTop });
    };
  }, [activityElementsRef, dispatchScrollPosition, rootElementRef]);

  useObserveScrollPosition(patchedDispatchScrollPosition);

  const [lastInteractedActivity] = useAcknowledgedActivity();

  const indexOfLastInteractedActivity = activities.indexOf(lastInteractedActivity);

  // Create a new ID for aria-activedescendant every time the active descendant change.
  // In our design, the transcript will only have 1 active activity and it has an ID. Other inactive activities will not have ID assigned.
  // This help with performance.
  // But browser usually do noop if the value of aria-activedescendant doesn't change.
  // That means, if we assign the same ID to another element, browser will do noop.
  // We need to generate a new ID so the browser see there is a change in aria-activedescendant value and perform accordingly.
  const activeDescendantElementId = useMemo(
    () => activeActivityKey && `webchat__basic-transcript__active-descendant-${random().toString(36).substr(2, 5)}`,
    [activeActivityKey]
  );

  const scrollActiveDescendantIntoView = useCallback(() => {
    const activeDescendant = activeDescendantElementId && document.getElementById(activeDescendantElementId);

    activeDescendant && activeDescendant.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [activeDescendantElementId]);

  const handleTranscriptFocus = useCallback(
    event => {
      const { currentTarget, target } = event;

      // When focus is placed on the transcript, scroll active descendant into the view.
      currentTarget === target && scrollActiveDescendantIntoView();
    },
    [scrollActiveDescendantIntoView]
  );

  // After new aria-activedescendant is assigned, we will need to scroll it into view.
  // User agent will scroll automatically for focusing element, but not for aria-activedescendant.
  // We need to do the scrolling manually.
  useEffect(() => scrollActiveDescendantIntoView(), [scrollActiveDescendantIntoView]);

  // If any activities has changed, reset the active descendant.
  useEffect(() => setActiveActivityKey(undefined), [activities, setActiveActivityKey]);

  const activateRelativeActivity = useCallback(
    delta => {
      if (isNaN(delta) || !renderingElements.length) {
        return setActiveActivityKey(undefined);
      }

      const index = renderingElements.findIndex(({ key }) => key === activeActivityKey);
      const nextIndex = ~index
        ? Math.max(0, Math.min(renderingElements.length - 1, index + delta))
        : renderingElements.length - 1;
      const nextActiveActivity = renderingElements[nextIndex];

      setActiveActivityKey(nextActiveActivity.key);
      rootElementRef.current && rootElementRef.current.focus();
    },
    [activeActivityKey, renderingElements, rootElementRef, setActiveActivityKey]
  );

  const handleTranscriptKeyDown = useCallback(
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
          activateRelativeActivity(fromEndOfTranscriptIndicator ? 0 : 1);
          break;

        case 'ArrowUp':
          activateRelativeActivity(fromEndOfTranscriptIndicator ? 0 : -1);
          break;

        case 'End':
          activateRelativeActivity(Infinity);
          break;

        case 'Enter':
          if (!fromEndOfTranscriptIndicator) {
            const activeEntry = renderingElements.find(({ key }) => key === activeActivityKey);

            if (activeEntry) {
              const { element: activeElement } =
                activityElementsRef.current.find(({ activity }) => activity === activeEntry.activity) || {};

              if (activeElement) {
                const [firstTabbableElement] = tabbableElements(activeElement).filter(
                  ({ className }) => className !== 'webchat__basic-transcript__sentinel'
                );

                firstTabbableElement && firstTabbableElement.focus();
              }
            }
          }

          break;

        case 'Escape':
          focus('sendBoxWithoutKeyboard');
          break;

        case 'Home':
          activateRelativeActivity(-Infinity);
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
    [activeActivityKey, activityElementsRef, activateRelativeActivity, focus, terminatorRef, renderingElements]
  );

  const labelId = useUniqueId('webchat__basic-transcript__label');

  // If SHIFT-TAB from "End of transcript" indicator, if activeActivityKey is not set (or no longer exists), set it the the bottommost activity.
  const setBottommostActiveActivityKeyIfNeeded = useCallback(() => {
    if (!~renderingElements.findIndex(({ key }) => key === activeActivityKey)) {
      const { key: lastActivityKey } = renderingElements[renderingElements.length - 1] || {};

      setActiveActivityKey(lastActivityKey);
    }
  }, [activeActivityKey, renderingElements, setActiveActivityKey]);

  const handleTranscriptKeyDownCapture = useCallback(
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
    [disabled, focus]
  );

  const focusTranscriptCallback = useCallback(() => rootElementRef.current && rootElementRef.current.focus(), [
    rootElementRef
  ]);

  useRegisterFocusTranscript(focusTranscriptCallback);

  return (
    <div
      aria-activedescendant={activeActivityKey ? activeDescendantElementId : undefined}
      aria-labelledby={labelId}
      className={classNames(
        'webchat__basic-transcript',
        basicTranscriptStyleSet + '',
        rootClassName,
        (className || '') + ''
      )}
      dir={direction}
      onFocus={handleTranscriptFocus}
      onKeyDown={handleTranscriptKeyDown}
      onKeyDownCapture={handleTranscriptKeyDownCapture}
      ref={rootElementRef}
      // For up/down arrow key navigation across activities, this component must be included in the tab sequence.
      // Otherwise, "aria-activedescendant" will not be narrated when the user press up/down arrow keys.
      // https://www.w3.org/TR/wai-aria-practices-1.1/#kbd_focus_activedescendant
      tabIndex={0}
    >
      <ScreenReaderText id={labelId} text={transcriptAriaLabel} />
      {!!renderingElements.length && (
        <FocusRedirector className="webchat__basic-transcript__sentinel" redirectRef={terminatorRef} />
      )}
      {/* This <section> is for live region only. Content is made invisible through CSS. */}
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
      <InternalTranscriptScrollable activities={renderingActivities}>
        {renderingElements.map(
          (
            {
              activity,
              callbackRef,
              key,
              handleFocus,
              handleKeyDown,
              hideTimestamp,
              renderActivity,
              renderActivityStatus,
              renderAvatar,
              role,
              shouldSpeak,
              showCallout
            },
            index
          ) => {
            const activeDescendant = activeActivityKey === key;

            return (
              <li
                aria-label={activityAriaLabel} // This will be read when pressing CAPSLOCK + arrow with screen reader
                className={classNames('webchat__basic-transcript__activity', {
                  'webchat__basic-transcript__activity--acknowledged': index <= indexOfLastInteractedActivity,
                  'webchat__basic-transcript__activity--from-bot': role !== 'user',
                  'webchat__basic-transcript__activity--from-user': role === 'user'
                })}
                id={activeDescendant ? activeDescendantElementId : undefined}
                key={key}
                onClickCapture={handleFocus}
                onKeyDown={handleKeyDown}
                ref={callbackRef}
              >
                <FocusRedirector
                  className="webchat__basic-transcript__sentinel"
                  onFocus={handleFocus}
                  redirectRef={rootElementRef}
                />
                {renderActivity({
                  hideTimestamp,
                  renderActivityStatus,
                  renderAvatar,
                  showCallout
                })}
                {shouldSpeak && <SpeakActivity activity={activity} />}
                <FocusRedirector
                  className="webchat__basic-transcript__sentinel"
                  onFocus={handleFocus}
                  redirectRef={rootElementRef}
                />
                <div
                  className={classNames('webchat__basic-transcript__activity-indicator', {
                    'webchat__basic-transcript__activity-indicator--active': activeDescendant,
                    'webchat__basic-transcript__activity-indicator--first': !index
                  })}
                />
              </li>
            );
          }
        )}
      </InternalTranscriptScrollable>
      {!!renderingElements.length && (
        <React.Fragment>
          <FocusRedirector
            className="webchat__basic-transcript__sentinel"
            onFocus={setBottommostActiveActivityKeyIfNeeded}
            redirectRef={rootElementRef}
          />
          <div className="webchat__basic-transcript__terminator" ref={terminatorRef} tabIndex={0}>
            <div className="webchat__basic-transcript__terminator-body">
              <div className="webchat__basic-transcript__terminator-text">End of transcript</div>
            </div>
          </div>
        </React.Fragment>
      )}
      <div className="webchat__basic-transcript__focus-indicator" />
    </div>
  );
};

InternalTranscript.defaultProps = {
  className: ''
};

InternalTranscript.propTypes = {
  activityElementsRef: PropTypes.shape({
    current: PropTypes.array.isRequired
  }).isRequired,
  className: PropTypes.string
};

const InternalScreenReaderTranscript = ({ renderingElements }) => {
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
  renderingElements: PropTypes.arrayOf(
    PropTypes.shape({
      activity: PropTypes.any,
      liveRegionKey: PropTypes.string
    })
  ).isRequired
};

// Separating high-frequency hooks to improve performance.
const InternalTranscriptScrollable = ({ activities, children }) => {
  const [{ activities: activitiesStyleSet }] = useStyleSet();
  const [{ hideScrollToEndButton }] = useStyleOptions();
  const [animatingToEnd] = useAnimatingToEnd();
  const [sticky] = useSticky();
  const focus = useFocus();
  const lastVisibleActivityId = getActivityUniqueId(activities[activities.length - 1] || {}); // Activity ID of the last visible activity in the list.
  const localize = useLocalizer();
  const scrollToEndButtonRef = useRef();

  const lastReadActivityIdRef = useRef(lastVisibleActivityId);
  const transcriptRoleDescription = localize('TRANSCRIPT_ARIA_ROLE_ALT');

  const allActivitiesRead = lastVisibleActivityId === lastReadActivityIdRef.current;

  const handleScrollToEndButtonClick = useCallback(() => {
    const { current } = scrollToEndButtonRef;

    // After clicking on the "New messages" button, we should focus on the first unread element.
    // This is for resolving the bug https://github.com/microsoft/BotFramework-WebChat/issues/3135.
    if (current) {
      const nextSiblings = nextSiblingAll(current);

      const firstUnreadTabbable = nextSiblings.reduce(
        (result, unreadActivityElement) => result || firstTabbableDescendant(unreadActivityElement),
        0
      );

      firstUnreadTabbable ? firstUnreadTabbable.focus() : focus('sendBoxWithoutKeyboard');
    }
  }, [focus, scrollToEndButtonRef]);

  if (sticky) {
    // If it is sticky, the user is at the bottom of the transcript, everything is read.
    // So mark the activity ID as read.
    lastReadActivityIdRef.current = lastVisibleActivityId;
  }

  // Finds where we should render the "New messages" button, in index. Returns -1 to hide the button.
  const renderSeparatorAfterIndex = useMemo(() => {
    // Don't show the button if:
    // - All activities have been read
    // - Currently animating towards bottom
    //   - "New messages" button must not flash when: 1. Type "help", 2. Scroll to top, 3. Type "help" again, 4. Expect the "New messages" button not flashy
    // - Hidden by style options
    // - It is already at the bottom (sticky)

    // Any changes to this logic, verify:
    // - "New messages" button should persist while programmatically scrolling to mid-point of the transcript:
    //   1. Type "help"
    //   2. Type "proactive", then immediately scroll to top
    //      Expect: the "New messages" button should appear
    //   3. Run hook "useScrollTo({ scrollTop: 500 })"
    //      Expect: when the scroll is animating to 500px, the "New messages" button should kept on the screen
    // - "New messages" button must not flashy:
    //   1. Type "help"
    //   2. Scroll to top
    //      Expect: no "New messages" button is shown
    //   3. Type "help" again
    //      Expect: "New messages" button must not flash-appear

    if (allActivitiesRead || animatingToEnd || hideScrollToEndButton || sticky) {
      return -1;
    }

    return activities.findIndex(activity => getActivityUniqueId(activity) === lastReadActivityIdRef.current);
  }, [activities, allActivitiesRead, animatingToEnd, hideScrollToEndButton, lastReadActivityIdRef, sticky]);

  return (
    <ReactScrollToBottomPanel className="webchat__basic-transcript__scrollable">
      <div aria-hidden={true} className="webchat__basic-transcript__filler" />
      <ul
        aria-roledescription={transcriptRoleDescription}
        className={classNames(activitiesStyleSet + '', 'webchat__basic-transcript__transcript')}
        role="list"
      >
        {React.Children.map(children, (child, index) => (
          <React.Fragment>
            {child}
            {/* We insert the "New messages" button here for tab ordering. Users should be able to TAB into the button. */}
            {index === renderSeparatorAfterIndex && (
              <ScrollToEndButton
                aria-valuemax={activities.length}
                aria-valuenow={index + 1}
                onClick={handleScrollToEndButtonClick}
                ref={scrollToEndButtonRef}
              />
            )}
          </React.Fragment>
        ))}
      </ul>
      <BasicTypingIndicator />
    </ReactScrollToBottomPanel>
  );
};

InternalTranscriptScrollable.propTypes = {
  activities: PropTypes.array.isRequired,
  children: PropTypes.any.isRequired
};

const SetScroller = ({ activityElementsRef, scrollerRef }) => {
  const [
    { autoScrollSnapOnActivity, autoScrollSnapOnActivityOffset, autoScrollSnapOnPage, autoScrollSnapOnPageOffset }
  ] = useStyleOptions();
  const [lastAcknowledgedActivity] = useAcknowledgedActivity();

  const lastAcknowledgedActivityRef = useRef(lastAcknowledgedActivity);

  lastAcknowledgedActivityRef.current = lastAcknowledgedActivity;

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
        const { current: lastAcknowledgedActivity } = lastAcknowledgedActivityRef;

        const values = [];

        if (patchedAutoScrollSnapOnActivity) {
          const { element: nthUnacknowledgedActivityElement } =
            activityElementsRef.current[
              activityElementsRef.current.findIndex(({ activity }) => activity === lastAcknowledgedActivity) +
                patchedAutoScrollSnapOnActivity
            ] || {};

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
            activityElementsRef.current[
              activityElementsRef.current.findIndex(({ activity }) => activity === lastAcknowledgedActivity) + 1
            ] || {};

          if (firstUnacknowledgedActivityElement) {
            values.push(
              firstUnacknowledgedActivityElement.offsetTop -
                scrollTop -
                offsetHeight * (1 - patchedAutoScrollSnapOnPage) +
                patchedAutoScrollSnapOnPageOffset
            );
          }
        }

        return values.reduce((minValue, value) => Math.min(minValue, value), Infinity);
      }

      return Infinity;
    },
    [
      activityElementsRef,
      autoScrollSnapOnActivity,
      autoScrollSnapOnActivityOffset,
      autoScrollSnapOnPage,
      autoScrollSnapOnPageOffset,
      lastAcknowledgedActivityRef
    ]
  );

  return false;
};

const BasicTranscript = ({ className }) => {
  const activityElementsRef = useRef([]);
  const scrollerRef = useRef(() => Infinity);

  const scroller = useCallback((...args) => scrollerRef.current(...args), [scrollerRef]);

  return (
    <ReactScrollToBottomComposer scroller={scroller}>
      <SetScroller activityElementsRef={activityElementsRef} scrollerRef={scrollerRef} />
      <InternalTranscript activityElementsRef={activityElementsRef} className={className} />
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
