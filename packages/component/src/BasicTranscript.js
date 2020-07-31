/* eslint no-magic-numbers: ["error", { "ignore": [-1, 0, 1] }] */

import { css } from 'glamor';
import { Panel as ScrollToBottomPanel, useAnimatingToEnd, useSticky } from 'react-scroll-to-bottom';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useRef } from 'react';

import BasicTypingIndicator from './BasicTypingIndicator';
import Fade from './Utils/Fade';
import firstTabbableDescendant from './Utils/firstTabbableDescendant';
import getActivityUniqueId from './Utils/getActivityUniqueId';
import intersectionOf from './Utils/intersectionOf';
import isZeroOrPositive from './Utils/isZeroOrPositive';
import removeInline from './Utils/removeInline';
import ScreenReaderActivity from './ScreenReaderActivity';
import ScrollToEndButton from './Activity/ScrollToEndButton';
import SpeakActivity from './Activity/Speak';
import useActivities from './hooks/useActivities';
import useCreateActivityRenderer from './hooks/useCreateActivityRenderer';
import useCreateActivityStatusRenderer from './hooks/useCreateActivityStatusRenderer';
import useCreateAvatarRenderer from './hooks/useCreateAvatarRenderer';
import useDirection from './hooks/useDirection';
import useFocus from './hooks/useFocus';
import useGroupActivities from './hooks/useGroupActivities';
import useLocalizer from './hooks/useLocalizer';
import useMemoize from './hooks/internal/useMemoize';
import useStyleOptions from './hooks/useStyleOptions';
import useStyleSet from './hooks/useStyleSet';
import useTranscriptActivityElementsRef from './hooks/internal/useTranscriptActivityElementsRef';
import useTranscriptRootElementRef from './hooks/internal/useTranscriptRootElementRef';

const ROOT_CSS = css({
  '&.webchat__basic-transcript': {
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
});

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

const BasicTranscript2 = ({ className }) => {
  const [{ activity: activityStyleSet }] = useStyleSet();
  const [{ bubbleFromUserNubOffset, bubbleNubOffset, groupTimestamp, showAvatarInGroup }] = useStyleOptions();
  const [activities] = useActivities();
  const [activityElementsRef] = useTranscriptActivityElementsRef();
  const [direction] = useDirection();
  const [rootElementRef] = useTranscriptRootElementRef();

  const createActivityRenderer = useCreateActivityRenderer();
  const createActivityStatusRenderer = useCreateActivityStatusRenderer();
  const createAvatarRenderer = useCreateAvatarRenderer();
  const groupActivities = useGroupActivities();
  const hideAllTimestamps = groupTimestamp === false;
  const localize = useLocalizer();

  const activityAriaLabel = localize('ACTIVITY_ARIA_LABEL_ALT');
  const transcriptRoleDescription = localize('TRANSCRIPT_ARIA_ROLE_ALT');

  // Gets renderer for every activities.
  // Some activities that are not visible, will return a falsy renderer.

  // Converting from createActivityRenderer({ activity, nextVisibleActivity }) to createActivityRenderer(activity, nextVisibleActivity).
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
      // In next render cycle, calls to createActivityRendererWithLiteralArgsMemoized() might return memoized result instead.
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

            // "hideTimestamp" is a render-time parameter for renderActivityStatus().
            // If set, it will hide if timestamp is being shown, but it will continue to show
            // retry prompt. And show the screen reader version of the timestamp.
            hideTimestamp:
              hideAllTimestamps || indexWithinSenderAndStatusGroup !== activitiesWithSameSenderAndStatus.length - 1,
            key,

            // When "liveRegionKey" change, it was show up in the live region momentarily.
            liveRegionKey: key + '|' + (messageBackDisplayText || text),
            renderActivity,
            renderActivityStatus,
            renderAvatar,

            // TODO: [P2] #2858 We should use core/definitions/speakingActivity for this predicate instead
            shouldSpeak: activity.channelData && activity.channelData.speak,
            showCallout
          });
        });
      });
    });

    const { current: activityElements } = activityElementsRef;

    // Update activityElementRef with new sets of activity, while retaining the existing referencing element if exists.

    activityElementsRef.current = renderingElements.map(({ activity: { id }, key }) => {
      const existingEntry = activityElements.find(entry => entry.key === key);

      return {
        activityID: id,
        element: existingEntry && existingEntry.element,
        key
      };
    });

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

  return (
    <div
      className={classNames(ROOT_CSS + '', 'webchat__basic-transcript', className + '')}
      dir={direction}
      ref={rootElementRef}
    >
      {/* This <section> is for live region only. Contents are made invisible through CSS. */}
      <section
        aria-atomic={false}
        aria-live="polite"
        aria-relevant="additions"
        aria-roledescription={transcriptRoleDescription}
        role="log"
      >
        {renderingElements.map(({ activity, liveRegionKey }) => (
          <Fade key={liveRegionKey}>{() => <ScreenReaderActivity activity={activity} />}</Fade>
        ))}
      </section>
      <InternalTranscriptScrollable activities={renderingActivities}>
        {renderingElements.map(
          ({
            activity,
            callbackRef,
            key,
            hideTimestamp,
            renderActivity,
            renderActivityStatus,
            renderAvatar,
            shouldSpeak,
            showCallout
          }) => (
            <li
              aria-label={activityAriaLabel} // This will be read when pressing CAPSLOCK + arrow with screen reader
              className={classNames(activityStyleSet + '', 'webchat__basic-transcript__activity')}
              key={key}
              ref={callbackRef}
            >
              {renderActivity({
                hideTimestamp,
                renderActivityStatus,
                renderAvatar,
                showCallout
              })}
              {shouldSpeak && <SpeakActivity activity={activity} />}
            </li>
          )
        )}
      </InternalTranscriptScrollable>
    </div>
  );
};

BasicTranscript2.defaultProps = {
  className: ''
};

BasicTranscript2.propTypes = {
  className: PropTypes.string
};

const InternalScreenReaderTranscript = ({ renderingElements }) => {
  const localize = useLocalizer();

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
        <Fade key={liveRegionKey}>{() => <ScreenReaderActivity activity={activity} />}</Fade>
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
    <ScrollToBottomPanel className="webchat__basic-transcript__scrollable">
      <div aria-hidden={true} className="webchat__basic-transcript__filler" />
      <ul
        aria-roledescription={transcriptRoleDescription}
        className={classNames(activitiesStyleSet + '', 'webchat__basic-transcript__transcript')}
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
    </ScrollToBottomPanel>
  );
};

InternalTranscriptScrollable.propTypes = {
  activities: PropTypes.array.isRequired,
  children: PropTypes.arrayOf(PropTypes.element).isRequired
};

export default BasicTranscript2;
