import { Composer as SayComposer } from 'react-say';
import { css } from 'glamor';
import { Panel as ScrollToBottomPanel } from 'react-scroll-to-bottom';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import ScrollToEndButton from './Activity/ScrollToEndButton';
import SpeakActivity from './Activity/Speak';
import useActivities from './hooks/useActivities';
import useGroupTimestamp from './hooks/useGroupTimestamp';
import useRenderActivity from './hooks/useRenderActivity';
import useRenderAttachment from './hooks/useRenderAttachment';
import useStyleOptions from './hooks/useStyleOptions';
import useStyleSet from './hooks/useStyleSet';
import useWebSpeechPonyfill from './hooks/useWebSpeechPonyfill';

const ROOT_CSS = css({
  overflow: 'hidden',
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
  listStyleType: 'none',

  '& > li.hide-timestamp .transcript-timestamp': {
    display: 'none'
  }
});

const DEFAULT_GROUP_TIMESTAMP = 300000; // 5 minutes

function sameTimestampGroup(activityX, activityY, groupTimestamp) {
  if (groupTimestamp === false) {
    return true;
  } else if (activityX && activityY) {
    groupTimestamp = typeof groupTimestamp === 'number' ? groupTimestamp : DEFAULT_GROUP_TIMESTAMP;

    if (activityX.from.role === activityY.from.role) {
      const timeX = new Date(activityX.timestamp).getTime();
      const timeY = new Date(activityY.timestamp).getTime();

      return Math.abs(timeX - timeY) <= groupTimestamp;
    }
  }

  return false;
}

const BasicTranscript = ({ className }) => {
  const [{ speechSynthesis, SpeechSynthesisUtterance } = {}] = useWebSpeechPonyfill();
  const [activities] = useActivities();
  const [renderActivity] = useRenderActivity();
  const [renderAttachment] = useRenderAttachment();
  const [groupTimestamp] = useGroupTimestamp();

  const [{ activities: activitiesStyleSet, activity: activityStyleSet }] = useStyleSet();
  const [{ hideScrollToEndButton }] = useStyleOptions();

  // We use 2-pass approach for rendering activities, for show/hide timestamp grouping.
  // Until the activity pass thru middleware, we never know if it is going to show up.
  // After we know which activities will show up, we can compute which activity will show timestamps.
  // If the activity does not render, it will not be spoken if text-to-speech is enabled.
  const activityElements = useMemo(
    () =>
      activities.reduce((activityElements, activity, index) => {
        const element = renderActivity({
          activity,
          renderAttachment,
          timestampClassName: 'transcript-timestamp'
        });

        element &&
          activityElements.push({
            activity,
            element,
            key: (activity.channelData && activity.channelData.clientActivityID) || activity.id || index,

            // TODO: [P2] We should use core/definitions/speakingActivity for this predicate instead
            shouldSpeak: activity.channelData && activity.channelData.speak
          });

        return activityElements;
      }, []),
    [activities, renderActivity, renderAttachment]
  );

  const activityElements2 = useMemo(
    () =>
      activityElements.map((activityElement, index) => {
        const { activity } = activityElement;
        const nextActivityElement = activityElements[index + 1];
        const { activity: nextActivity } = nextActivityElement || {};

        return {
          ...activityElement,
          // Hide timestamp if same timestamp group with the next activity
          shouldShowTimestamp: !sameTimestampGroup(activity, nextActivity, groupTimestamp)
        };
      }),
    [activityElements, groupTimestamp]
  );

  return (
    <div className={classNames(ROOT_CSS + '', className + '')} role="log">
      <ScrollToBottomPanel className={PANEL_CSS + ''}>
        <div className={FILLER_CSS} />
        <SayComposer speechSynthesis={speechSynthesis} speechSynthesisUtterance={SpeechSynthesisUtterance}>
          <ul
            aria-atomic="false"
            aria-live="polite"
            aria-relevant="additions text"
            className={classNames(LIST_CSS + '', activitiesStyleSet + '')}
            role="list"
          >
            {activityElements2.map(({ activity, element, key, shouldShowTimestamp, shouldSpeak }) => (
              <li
                // Because of differences in browser implementations, aria-label=" " is used to make the screen reader not repeat the same text multiple times in Chrome v75
                aria-label=" "
                className={classNames(activityStyleSet + '', {
                  'hide-timestamp': !shouldShowTimestamp
                })}
                key={key}
                role="listitem"
              >
                {element}
                {shouldSpeak && <SpeakActivity activity={activity} />}
              </li>
            ))}
          </ul>
        </SayComposer>
      </ScrollToBottomPanel>
      {!hideScrollToEndButton && <ScrollToEndButton />}
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
