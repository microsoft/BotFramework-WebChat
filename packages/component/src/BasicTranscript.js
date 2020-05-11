import { css } from 'glamor';
import { Panel as ScrollToBottomPanel } from 'react-scroll-to-bottom';
import { StateContext as ScrollToBottomStateContext } from 'react-scroll-to-bottom';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useRef } from 'react';

import BasicTypingIndicator from './BasicTypingIndicator';
import ScrollToEndButton from './Activity/ScrollToEndButton';
import SpeakActivity from './Activity/Speak';
import useActivities from './hooks/useActivities';
import useDirection from './hooks/useDirection';
import useRenderActivity from './hooks/useRenderActivity';
import useRenderAttachment from './hooks/useRenderAttachment';
import useStyleOptions from './hooks/useStyleOptions';
import useStyleSet from './hooks/useStyleSet';

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

const BasicTranscriptContent = ({ animating, sticky }) => {
  const [{ activities: activitiesStyleSet, activity: activityStyleSet }] = useStyleSet();
  let [{ hideScrollToEndButton }] = useStyleOptions();
  const [activities] = useActivities();
  const renderAttachment = useRenderAttachment();
  const renderActivity = useRenderActivity(renderAttachment);
  const renderActivityElement = useCallback(
    (activity, nextVisibleActivity) =>
      renderActivity({
        activity,
        nextVisibleActivity
      }),
    [renderActivity]
  );

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

  // Ignore activity types other than "message"
  const lastMessageActivity = [...activities].reverse().find(({ type }) => type === 'message');
  const lastShownActivityId = (lastMessageActivity || {}).id;
  const lastReadActivityIdRef = useRef(lastShownActivityId);

  const { current: lastReadActivityId } = lastReadActivityIdRef;

  if (sticky) {
    // If it is sticky, mark the activity ID as read.
    lastReadActivityIdRef.current = lastShownActivityId;
  }

  // Don't show the button if:
  // - The scroll bar is animating
  //   - Otherwise, this will cause a flashy button when: 1. Scroll to top, 2. Send something, 3. The button flashes when it is scrolling down
  // - It is already at the bottom (sticky)
  // - The last activity ID has been read
  if (animating || sticky || lastShownActivityId === lastReadActivityId) {
    hideScrollToEndButton = true;
  }

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
            {!hideScrollToEndButton &&
              activity.id === lastReadActivityId &&
              index !== activityElementsWithMetadata.length - 1 && (
                <li role="group">
                  <ScrollToEndButton />
                </li>
              )}
          </React.Fragment>
        ))}
      </ul>
      <BasicTypingIndicator />
    </React.Fragment>
  );
};

BasicTranscriptContent.defaultProps = {
  className: ''
};

BasicTranscriptContent.propTypes = {
  className: PropTypes.string
};

const BasicTranscript = ({ className }) => {
  const [direction] = useDirection();

  return (
    <div className={classNames(ROOT_CSS + '', className + '')} dir={direction} role="log">
      <ScrollToBottomPanel className={PANEL_CSS + ''}>
        <ScrollToBottomStateContext.Consumer>
          {({ animating, sticky }) => <BasicTranscriptContent animating={animating} sticky={sticky} />}
        </ScrollToBottomStateContext.Consumer>
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
