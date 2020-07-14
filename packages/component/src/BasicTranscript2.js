import { css } from 'glamor';
import { Panel as ScrollToBottomPanel, useAnimatingToEnd, useSticky } from 'react-scroll-to-bottom';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useRef } from 'react';

import BasicTypingIndicator from './BasicTypingIndicator';
import Fade from './Utils/Fade';
import getActivityUniqueId from './Utils/getActivityUniqueId';
import isZeroOrPositive from './Utils/isZeroOrPositive';
import ScreenReaderActivity from './ScreenReaderActivity';
import ScrollToEndButton from './Activity/ScrollToEndButton';
import SpeakActivity from './Activity/Speak';
import useActivities from './hooks/useActivities';
import useDirection from './hooks/useDirection';
import useGroupActivities from './hooks/useGroupActivities';
import useLocalizer from './hooks/useLocalizer';
import useRenderActivity from './hooks/useRenderActivity';
import useRenderActivityStatus from './hooks/useRenderActivityStatus';
import useRenderAvatar from './hooks/useRenderAvatar';
import useStyleOptions from './hooks/useStyleOptions';
import useStyleSet from './hooks/useStyleSet';

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

function intersectionOf(arg0, ...args) {
  return args.reduce(
    (interim, arg) =>
      interim.reduce((intersection, item) => {
        arg.includes(item) && intersection.push(item);

        return intersection;
      }, []),
    arg0
  );
}

function removeInline(array, ...items) {
  items.forEach(item => {
    const index = array.indexOf(item);

    ~index && array.splice(index, 1);
  });
}

function firstTabbableDescendant(element) {
  // This is best-effort for finding a tabbable element.
  // For a comprehensive list, please refer to https://allyjs.io/data-tables/focusable.html and update this list accordingly.
  const focusables = element.querySelectorAll(
    'a[href], audio, button, details, details summary, embed, iframe, input, object, rect, select, svg[focusable], textarea, video, [tabindex]'
  );

  return [].find.call(focusables, focusable => {
    const tabIndex = getTabIndex(focusable);

    return typeof tabIndex === 'number' && tabIndex >= 0;
  });
}

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
  const [{ activities: activitiesStyleSet, activity: activityStyleSet }] = useStyleSet();
  const [{ bubbleFromUserNubOffset, bubbleNubOffset, hideScrollToEndButton, showAvatarInGroup }] = useStyleOptions();
  const [activities] = useActivities();
  const [animatingToEnd] = useAnimatingToEnd();
  const [direction] = useDirection();
  const [sticky] = useSticky();
  const createActivityRenderer = useRenderActivity();
  const createActivityStatusRenderer = useRenderActivityStatus();
  const createAvatarRenderer = useRenderAvatar();
  const groupActivities = useGroupActivities();
  const localize = useLocalizer();
  const scrollToEndButtonRef = useRef();

  const activityAriaLabel = localize('ACTIVITY_ARIA_LABEL_ALT');
  const transcriptRoleDescription = localize('TRANSCRIPT_ARIA_ROLE_ALT');

  // Gets renderer for every activities.
  // Some activities that are not visible, will return a falsy renderer.

  const activitiesWithRenderer = useMemo(() => {
    const activitiesWithRenderer = [];

    [...activities].reverse().forEach(activity => {
      const { activity: nextVisibleActivity } = activitiesWithRenderer[0] || {};
      const renderActivity = createActivityRenderer({ activity, nextVisibleActivity });

      renderActivity &&
        activitiesWithRenderer.splice(0, 0, {
          activity,
          renderActivity
        });
    });

    return activitiesWithRenderer;
  }, [createActivityRenderer, activities]);

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
        'botframework-webchat: Not every activities are grouped by "sender". Please fix "groupActivitiesMiddleware" and group every activities.'
      );
    }

    if (!validateAllActivitiesTagged(visibleActivities, activitiesGroupByStatus)) {
      console.warn(
        'botframework-webchat: Not every activities are grouped by "status". Please fix "groupActivitiesMiddleware" and group every activities.'
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
      const firstActivity = activitiesWithSameSender[0][0];
      const renderAvatar = createAvatarRenderer({ activity: firstActivity });

      activitiesWithSameSender.forEach((activitiesWithSameSenderAndStatus, indexWithinSenderGroup) => {
        const renderActivityStatus = createActivityStatusRenderer({
          activity: activitiesWithSameSenderAndStatus[activitiesWithSameSenderAndStatus.length - 1]
        });

        activitiesWithSameSenderAndStatus.forEach((activity, indexWithinSenderAndStatusGroup) => {
          const { renderActivity } = activitiesWithRenderer.find(entry => entry.activity === activity);
          const key = getActivityUniqueId(activity) || renderingElements.length;
          const {
            channelData: { messageBack: { displayText: messageBackDisplayText } = {} } = {},
            from: { role },
            text
          } = activity;

          const fromUser = role === 'user';

          const topSideNub = fromUser ? topSideUserNub : topSideBotNub;

          let showAvatar;

          // Depends on different "showAvatarInGroup" setting, we will show the avatar in different positions.
          if (showAvatarInGroup === 'sender') {
            if (topSideNub) {
              showAvatar = !indexWithinSenderGroup && !indexWithinSenderAndStatusGroup;
            } else {
              showAvatar =
                indexWithinSenderGroup === activitiesWithSameSender.length - 1 &&
                indexWithinSenderAndStatusGroup === activitiesWithSameSenderAndStatus.length - 1;
            }
          } else if (showAvatarInGroup === 'status') {
            if (topSideNub) {
              showAvatar = !indexWithinSenderAndStatusGroup;
            } else {
              showAvatar = indexWithinSenderAndStatusGroup === activitiesWithSameSenderAndStatus.length - 1;
            }
          } else {
            showAvatar = true;
          }

          renderingElements.push({
            activity,
            key,

            // When "liveRegionKey" change, it was show up in the live region momentarily.
            liveRegionKey: key + '|' + (messageBackDisplayText || text),
            renderActivity,
            renderActivityStatus:
              // We only show the activity status at the end of the sender group.
              indexWithinSenderAndStatusGroup === activitiesWithSameSenderAndStatus.length - 1 && renderActivityStatus,
            renderAvatar: showAvatar && renderAvatar,

            // TODO: [P2] #2858 We should use core/definitions/speakingActivity for this predicate instead
            shouldSpeak: activity.channelData && activity.channelData.speak
          });
        });
      });
    });

    return renderingElements;
  }, [
    activitiesWithRenderer,
    activityTree,
    bubbleFromUserNubOffset,
    bubbleNubOffset,
    createActivityStatusRenderer,
    createAvatarRenderer,
    showAvatarInGroup
  ]);

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

  // Activity ID of the last visible activity in the list.
  const lastVisibleActivityId = getActivityUniqueId(renderingElements[renderingElements.length - 1] || {});

  const lastReadActivityIdRef = useRef(lastVisibleActivityId);

  const allActivitiesRead = lastVisibleActivityId === lastReadActivityIdRef.current;

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

    return renderingElements.findIndex(
      ({ activity }) => getActivityUniqueId(activity) === lastReadActivityIdRef.current
    );
  }, [allActivitiesRead, animatingToEnd, hideScrollToEndButton, lastReadActivityIdRef, renderingElements, sticky]);

  return (
    <div className={classNames(ROOT_CSS + '', 'webchat__basic-transcript', className + '')} dir={direction}>
      <ScrollToBottomPanel className="webchat__basic-transcript__scrollable">
        <div aria-hidden={true} className="webchat__basic-transcript__filler" />

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

        <ul
          aria-roledescription={transcriptRoleDescription}
          className={classNames(activitiesStyleSet + '', 'webchat__basic-transcript__transcript')}
        >
          {renderingElements.map(
            ({ activity, key, renderActivity, renderActivityStatus, renderAvatar, shouldSpeak }, index) => (
              <React.Fragment key={key}>
                <li
                  aria-label={activityAriaLabel} // This will be read when pressing CAPSLOCK + arrow with screen reader
                  className={classNames(activityStyleSet + '', 'webchat__basic-transcript__activity')}
                >
                  {renderActivity({
                    renderActivityStatus,
                    renderAvatar
                  })}
                  {shouldSpeak && <SpeakActivity activity={activity} />}
                </li>
                {/* We insert the "New messages" button here for tab ordering. Users should be able to TAB into the button. */}
                {index === renderSeparatorAfterIndex && (
                  <ScrollToEndButton
                    aria-valuemax={renderingElements.length}
                    aria-valuenow={index + 1}
                    onClick={handleScrollToEndButtonClick}
                    ref={scrollToEndButtonRef}
                  />
                )}
              </React.Fragment>
            )
          )}
        </ul>
        <BasicTypingIndicator />
      </ScrollToBottomPanel>
    </div>
  );
};

BasicTranscript2.defaultProps = {
  className: ''
};

BasicTranscript2.propTypes = {
  className: PropTypes.string
};

export default BasicTranscript2;
