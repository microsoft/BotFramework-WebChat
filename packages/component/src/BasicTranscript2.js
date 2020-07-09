import { css } from 'glamor';
import { Panel as ScrollToBottomPanel, useAnimatingToEnd, useSticky } from 'react-scroll-to-bottom';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useRef } from 'react';

import BasicTypingIndicator from './BasicTypingIndicator';
import Fade from './Utils/Fade';
import ScreenReaderActivity from './ScreenReaderActivity';
import ScrollToEndButton from './Activity/ScrollToEndButton';
import SpeakActivity from './Activity/Speak';
import useActivities from './hooks/useActivities';
import useCreateActivityRenderer from './hooks/useRenderActivity';
import useDirection from './hooks/useDirection';
import useGroupTimestamp from './hooks/useGroupTimestamp';
import useLocalizer from './hooks/useLocalizer';
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
      WebkitOverflowScrolling: 'touch'
    },

    '& .webchat__basic-transcript__transcript': {
      listStyleType: 'none'
    }
  }
});

function getActivityUniqueId(activity) {
  return (activity.channelData && activity.channelData.clientActivityID) || activity.id;
}

function group(items, grouping) {
  let lastGroup;
  const groups = [];
  let lastItem;

  items.forEach(item => {
    if (lastItem && grouping(lastItem, item)) {
      lastGroup.push(item);
    } else {
      lastGroup = [item];
      groups.push(lastGroup);
    }

    lastItem = item;
  });

  return groups;
}

function intersectionOf(arg0, ...args) {
  return args.reduce(
    (interim, arg) =>
      interim.reduce((intersection, item) => {
        args[0].includes(item) && intersection.push(item);

        return intersection;
      }, []),
    arg0
  );
}

function partitionActivities(activities, { groupTimestamp }) {
  return {
    activityStatus: group(activities, (x, y) => shouldGroupTimestamp(x, y, groupTimestamp)),
    avatar: group(activities, (x, y) => x.from.role === y.from.role)
  };
}

function removeInline(array, item) {
  const index = array.indexOf(item);

  ~index && array.splice(index, 1);
}

function shouldGroupTimestamp(activityX, activityY, groupTimestamp) {
  if (groupTimestamp === false) {
    // Hide timestamp for all activities.
    return true;
  } else if (activityX && activityY) {
    groupTimestamp = typeof groupTimestamp === 'number' ? groupTimestamp : Infinity;

    const timeX = new Date(activityX.timestamp).getTime();
    const timeY = new Date(activityY.timestamp).getTime();

    return Math.abs(timeX - timeY) <= groupTimestamp;
  }

  return false;
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

const BasicTranscript2 = ({ className }) => {
  const [{ activities: activitiesStyleSet, activity: activityStyleSet }] = useStyleSet();
  const [{ hideScrollToEndButton }] = useStyleOptions();
  const [activities] = useActivities();
  const [animatingToEnd] = useAnimatingToEnd();
  const [direction] = useDirection();
  const [groupTimestamp] = useGroupTimestamp();
  const [sticky] = useSticky();
  const createActivityRenderer = useCreateActivityRenderer();
  const createAvatarRenderer = useRenderAvatar();
  const createActivityStatusRenderer = useRenderActivityStatus();
  const scrollToEndButtonRef = useRef();
  const localize = useLocalizer();

  const transcriptRoleDescription = localize('TRANSCRIPT_ARIA_ROLE_ALT');
  const activityAriaLabel = localize('ACTIVITY_ARIA_LABEL_ALT');

  const renderingActivities = activities
    .map(activity => ({
      activity,
      renderActivity: createActivityRenderer({ activity }),

      // TODO: [P2] #2858 We should use core/definitions/speakingActivity for this predicate instead
      shouldSpeak: activity.channelData && activity.channelData.speak
    }))
    .filter(({ renderActivity }) => renderActivity);

  const partitions = partitionActivities(
    renderingActivities.map(({ activity }) => activity),
    { groupTimestamp }
  );
  const activityPool = [...activities];
  const avatarGroups = [];

  while (activityPool.length) {
    const [activity] = activityPool;
    const sameSenderActivities = partitions.avatar.find(activities => activities.includes(activity));
    const avatarGroup = [];

    avatarGroups.push(avatarGroup);

    sameSenderActivities.forEach(activity => {
      if (!activityPool.includes(activity)) {
        // Already added
        return;
      }

      const activitiesWithSameActivityStatus = partitions.activityStatus.find(activities =>
        activities.includes(activity)
      );

      const activityStatusGroup = intersectionOf(activityPool, sameSenderActivities, activitiesWithSameActivityStatus);

      // if (activities.length === 3) {
      //   console.warn(intersectionOf(activityPool, sameSenderActivities));
      //   console.warn(intersectionOf(activityPool, sameSenderActivities, activitiesWithSameActivityStatus));
      //   console.warn('!!!', activityStatusGroup);
      // }

      avatarGroup.push(activityStatusGroup);
      activityStatusGroup.forEach(activity => removeInline(activityPool, activity));
    });
  }

  const flatten = [];

  avatarGroups.forEach(avatarGroup => {
    const firstActivity = avatarGroup[0][0];
    const renderAvatar = createAvatarRenderer({ activity: firstActivity });

    avatarGroup.forEach((activityStatusGroups, index1) => {
      const renderActivityStatus = createActivityStatusRenderer({ activity: activityStatusGroups[0] });

      activityStatusGroups.forEach((activity, index2) => {
        const { renderActivity, shouldSpeak } = renderingActivities.find(entry => entry.activity === activity);
        const key = (activity.channelData && activity.channelData.clientActivityID) || activity.id || flatten.length;
        const { channelData: { messageBack: { displayText: messageBackDisplayText } = {} } = {}, text } = activity;

        flatten.push({
          activity,
          leading: index1 === 0 && index2 === 0,
          key,
          trailing: index1 === avatarGroup.length - 1 && index2 === activityStatusGroups.length - 1,
          liveRegionKey: key + '|' + (messageBackDisplayText || text),
          renderActivity,
          renderActivityStatus,
          renderAvatar,
          shouldSpeak
        });
      });
    });
  });

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
  const { activity: { id: lastVisibleActivityId } = {} } = flatten[flatten.length - 1] || {};

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

    return flatten.findIndex(({ activity: { id } }) => id === lastReadActivityIdRef.current);
  }, [allActivitiesRead, animatingToEnd, flatten, hideScrollToEndButton, lastReadActivityIdRef, sticky]);

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
          {flatten.map(({ activity, liveRegionKey }) => (
            <Fade key={liveRegionKey}>{() => <ScreenReaderActivity activity={activity} />}</Fade>
          ))}
        </section>

        <ul
          aria-roledescription={transcriptRoleDescription}
          className={classNames(activitiesStyleSet + '', 'webchat__basic-transcript__transcript')}
        >
          {flatten.map(
            (
              { activity, key, leading, renderActivity, renderActivityStatus, renderAvatar, shouldSpeak, trailing },
              index
            ) => (
              <React.Fragment key={key}>
                <li
                  aria-label={activityAriaLabel} // This will be read when pressing CAPSLOCK + arrow with screen reader
                  className={classNames(activityStyleSet + '', 'webchat__basic-transcript__activity')}
                >
                  {renderActivity({
                    leading,
                    renderActivityStatus,
                    renderAvatar,
                    trailing
                  })}
                  {shouldSpeak && <SpeakActivity activity={activity} />}
                </li>
                {/* We insert the "New messages" button here for tab ordering. Users should be able to TAB into the button. */}
                {index === renderSeparatorAfterIndex && (
                  <ScrollToEndButton
                    aria-valuemax={flatten.length}
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
