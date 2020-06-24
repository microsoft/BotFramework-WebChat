/* eslint no-magic-numbers: ["error", { "ignore": [-1, 0, 1] }] */

import { css } from 'glamor';
import { Panel as ScrollToBottomPanel, useAnimatingToEnd, useSticky } from 'react-scroll-to-bottom';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useRef } from 'react';

import BasicTypingIndicator from './BasicTypingIndicator';
import ScrollToEndButton from './Activity/ScrollToEndButton';
import SpeakActivity from './Activity/Speak';
import useActivities from './hooks/useActivities';
import useDirection from './hooks/useDirection';
import useFocus from './hooks/useFocus';
import useRenderActivity from './hooks/useRenderActivity';
import useRenderAttachment from './hooks/useRenderAttachment';
import useStyleOptions from './hooks/useStyleOptions';
import useStyleSet from './hooks/useStyleSet';
import getTabIndex from './Utils/TypeFocusSink/getTabIndex';

const ROOT_CSS = css({
  overflow: 'hidden',
  // Make sure to set "position: relative" here to form another stacking context for the scroll-to-end button.
  // Stacking context help isolating elements that use "z-index" from global pollution.
  // https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index/The_stacking_context
  position: 'relative'
});

const PANEL_CSS = css({
  display: 'flex',
  flexDirection: 'column',
  WebkitOverflowScrolling: 'touch'
});

const FILLER_CSS = css({
  flex: 1
});

const LIST_CSS = css({
  listStyleType: 'none'
});

function useMemoize(fn) {
  return useMemo(() => {
    let cache = [];

    return run => {
      const nextCache = [];
      const result = run((...args) => {
        const { result } = [...cache, ...nextCache].find(
          ({ args: cachedArgs }) =>
            args.length === cachedArgs.length && args.every((arg, index) => Object.is(arg, cachedArgs[index]))
        ) || { result: fn(...args) };

        nextCache.push({ args, result });

        return result;
      });

      cache = nextCache;

      return result;
    };
  }, [fn]);
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

const BasicTranscriptContent = () => {
  const [{ activities: activitiesStyleSet, activity: activityStyleSet }] = useStyleSet();
  const [{ hideScrollToEndButton }] = useStyleOptions();
  const [activities] = useActivities();
  const [animatingToEnd] = useAnimatingToEnd();
  const [sticky] = useSticky();
  const focus = useFocus();
  const renderAttachment = useRenderAttachment();
  const scrollToEndButtonRef = useRef();

  const renderActivity = useRenderActivity(renderAttachment);

  const renderActivityElement = useCallback(
    (activity, nextVisibleActivity) =>
      renderActivity({
        activity,
        nextVisibleActivity
      }),
    [renderActivity]
  );

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

  const memoizeRenderActivityElement = useMemoize(renderActivityElement);

  const activityElementsWithMetadata = useMemo(
    () =>
      memoizeRenderActivityElement(renderActivityElement => {
        const { result: activityElementsWithMetadata } = [...activities].reverse().reduce(
          ({ nextVisibleActivity, result }, activity, index) => {
            const element = renderActivityElement(activity, nextVisibleActivity);

            // Until the activity passes through middleware, it is unknown whether the activity will be visible.
            // If the activity does not render, it will not be spoken if text-to-speech is enabled.
            if (element) {
              result = [
                {
                  activity,
                  element,
                  key: (activity.channelData && activity.channelData.clientActivityID) || activity.id || index,

                  // TODO: [P2] #2858 We should use core/definitions/speakingActivity for this predicate instead
                  shouldSpeak: activity.channelData && activity.channelData.speak
                },
                ...result
              ];

              nextVisibleActivity = activity;
            }

            return { nextVisibleActivity, result };
          },
          { nextVisibleActivity: undefined, result: [] }
        );

        return activityElementsWithMetadata;
      }),
    [activities, memoizeRenderActivityElement]
  );

  // Activity ID of the last visible activity in the list.
  const { activity: { id: lastVisibleActivityId } = {} } =
    activityElementsWithMetadata[activityElementsWithMetadata.length - 1] || {};
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

    return activityElementsWithMetadata.findIndex(({ activity: { id } }) => id === lastReadActivityIdRef.current);
  }, [activityElementsWithMetadata, allActivitiesRead, animatingToEnd, hideScrollToEndButton, sticky]);

  return (
    <React.Fragment>
      <div aria-hidden={true} className={FILLER_CSS} />
      <ul
        aria-atomic="false"
        aria-live="polite"
        aria-relevant="additions"
        className={classNames(LIST_CSS + '', activitiesStyleSet + '')}
        role="list"
      >
        {activityElementsWithMetadata.map(({ activity, element, key, shouldSpeak }, index) => (
          <React.Fragment key={key}>
            <li className={activityStyleSet + ''} role="listitem">
              {element}
              {shouldSpeak && <SpeakActivity activity={activity} />}
            </li>
            {/* We insert the "New messages" button here for tab ordering. Users should be able to TAB into the button. */}
            {index === renderSeparatorAfterIndex && (
              <ScrollToEndButton
                aria-valuemax={activityElementsWithMetadata.length}
                aria-valuenow={index + 1}
                onClick={handleScrollToEndButtonClick}
                ref={scrollToEndButtonRef}
              />
            )}
          </React.Fragment>
        ))}
      </ul>
      <BasicTypingIndicator />
    </React.Fragment>
  );
};

const BasicTranscript = ({ className }) => {
  const [direction] = useDirection();

  return (
    <div className={classNames(ROOT_CSS + '', className + '')} dir={direction} role="log">
      <ScrollToBottomPanel className={PANEL_CSS + ''}>
        <BasicTranscriptContent />
      </ScrollToBottomPanel>
    </div>
  );
};

BasicTranscript.defaultProps = {
  className: ''
};

BasicTranscript.propTypes = {
  className: PropTypes.string
};

export default BasicTranscript;

export { useMemoize };
