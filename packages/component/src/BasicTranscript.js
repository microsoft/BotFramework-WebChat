import { Composer as SayComposer } from 'react-say';
import { css } from 'glamor';
import { Panel as ScrollToBottomPanel } from 'react-scroll-to-bottom';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import connectToWebChat from './connectToWebChat';
import ScrollToEndButton from './Activity/ScrollToEndButton';
import SpeakActivity from './Activity/Speak';

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

const BasicTranscript = ({
  activityRenderer,
  activities,
  attachmentRenderer,
  className,
  groupTimestamp,
  styleSet,
  webSpeechPonyfill
}) => {
  const { speechSynthesis, SpeechSynthesisUtterance } = webSpeechPonyfill || {};

  // We use 2-pass approach for rendering activities, for show/hide timestamp grouping.
  // Until the activity pass thru middleware, we never know if it is going to show up.
  // After we know which activities will show up, we can compute which activity will show timestamps.
  // If the activity does not render, it will not be spoken if text-to-speech is enabled.
  const activityElements = activities.reduce((activityElements, activity) => {
    const element = activityRenderer({
      activity,
      timestampClassName: 'transcript-timestamp'
    })(({ attachment }) => attachmentRenderer({ activity, attachment }));

    element &&
      activityElements.push({
        activity,
        element
      });

    return activityElements;
  }, []);

  return (
    <div className={classNames(ROOT_CSS + '', className + '')} role="log">
      <ScrollToBottomPanel className={PANEL_CSS + ''}>
        <div className={FILLER_CSS} />
        <SayComposer speechSynthesis={speechSynthesis} speechSynthesisUtterance={SpeechSynthesisUtterance}>
          <ul
            aria-atomic="false"
            aria-live="polite"
            aria-relevant="additions text"
            className={classNames(LIST_CSS + '', styleSet.activities + '')}
            role="list"
          >
            {activityElements.map(({ activity, element }, index) => (
              <li
                /* Because of differences in browser implementations, aria-label=" " is used to make the screen reader not repeat the same text multiple times in Chrome v75 */
                aria-label=" "
                className={classNames(styleSet.activity + '', {
                  // Hide timestamp if same timestamp group with the next activity
                  'hide-timestamp': sameTimestampGroup(
                    activity,
                    (activityElements[index + 1] || {}).activity,
                    groupTimestamp
                  )
                })}
                key={(activity.channelData && activity.channelData.clientActivityID) || activity.id || index}
                role="listitem"
              >
                {element}
                {// TODO: [P2] We should use core/definitions/speakingActivity for this predicate instead
                speechSynthesis && activity.channelData && activity.channelData.speak && (
                  <SpeakActivity activity={activity} />
                )}
              </li>
            ))}
          </ul>
        </SayComposer>
      </ScrollToBottomPanel>
      {!styleSet.options.hideScrollToEndButton && <ScrollToEndButton />}
    </div>
  );
};

BasicTranscript.defaultProps = {
  className: '',
  groupTimestamp: true,
  webSpeechPonyfill: undefined
};

BasicTranscript.propTypes = {
  activities: PropTypes.array.isRequired,
  activityRenderer: PropTypes.func.isRequired,
  attachmentRenderer: PropTypes.func.isRequired,
  className: PropTypes.string,
  groupTimestamp: PropTypes.oneOfType([PropTypes.bool.isRequired, PropTypes.number.isRequired]),
  styleSet: PropTypes.shape({
    activities: PropTypes.any.isRequired,
    activity: PropTypes.any.isRequired,
    options: PropTypes.shape({
      hideScrollToEndButton: PropTypes.bool.isRequired
    }).isRequired
  }).isRequired,
  webSpeechPonyfill: PropTypes.shape({
    speechSynthesis: PropTypes.any,
    SpeechSynthesisUtterance: PropTypes.any
  })
};

export default connectToWebChat(
  ({ activities, activityRenderer, attachmentRenderer, groupTimestamp, styleSet, webSpeechPonyfill }) => ({
    activities,
    activityRenderer,
    attachmentRenderer,
    groupTimestamp,
    styleSet,
    webSpeechPonyfill
  })
)(BasicTranscript);
