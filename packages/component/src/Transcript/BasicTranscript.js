import { Composer as SayComposer } from 'react-say';
import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';
import ScrollToBottom from 'react-scroll-to-bottom';

import connectWithContext from '../connectWithContext';
import SpeakActivity from '../Activity2/Speak';

const ROOT_CSS = css({
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

function shouldShowActivity(activity) {
  if (activity) {
    if (activity.type === 'message') {
      const { attachments = [], text } = activity;

      if (
        // Do not show postback
        !(activity.channelData && activity.channelData.postBack)
        // Do not show empty bubbles (no text and attachments, and not "typing")
        && (text || attachments.length)
      ) {
        return true;
      }
    } else if (activity.type === 'typing') {
      return true;
    }
  }

  return false;
}

function shouldShowTimestamp(activity, nextActivity, groupTimestamp) {
  if (groupTimestamp === false) {
    return false;
  } else {
    groupTimestamp = typeof groupTimestamp === 'number' ? groupTimestamp : 5 * 60 * 1000;

    if (activity.type !== 'message') {
      // Hide timestamp for typing
      return false;
    } else if (nextActivity && activity.from.role === nextActivity.from.role) {
      const time = new Date(activity.timestamp).getTime();
      const nextTime = new Date(nextActivity.timestamp).getTime();

      return (nextTime - time) > groupTimestamp;
    } else {
      return true;
    }
  }
}

const BasicTranscript = ({
  activityRenderer,
  activities,
  attachmentRenderer,
  className,
  groupTimestamp,
  styleSet,
  webSpeechPonyfill: { speechSynthesis, SpeechSynthesisUtterance } = {}
}) => {
  const visibleActivities = activities.filter(shouldShowActivity);

  return (
    <ScrollToBottom
      className={ className }
      threshold={ styleSet.options.scrollToBottomThreshold }
      scrollViewClassName={ ROOT_CSS + '' }
    >
      <div className={ FILLER_CSS } />
      <SayComposer
        speechSynthesis={ speechSynthesis }
        speechSynthesisUtterance={ SpeechSynthesisUtterance }
      >
        <ul className={ classNames(LIST_CSS + '', styleSet.activities + '') }>
          {
            visibleActivities.map((activity, index) => {
              const showTimestamp = shouldShowTimestamp(activity, visibleActivities[index + 1], groupTimestamp);

              return (
                <li
                  className={ styleSet.activity }
                  key={ activity.id || (activity.channelData && activity.channelData.clientActivityID) || index }
                >
                  { activityRenderer({ activity, showTimestamp })(({ attachment }) => attachmentRenderer({ activity, attachment })) }
                  { activity.channelData && activity.channelData.speak && <SpeakActivity activity={ activity } /> }
                </li>
              );
            })
          }
        </ul>
      </SayComposer>
    </ScrollToBottom>
  );
}

export default connectWithContext(
  ({
    activities,
    activityRenderer,
    attachmentRenderer,
    groupTimestamp,
    styleSet,
    webSpeechPonyfill
  }) => ({
    activities,
    activityRenderer,
    attachmentRenderer,
    groupTimestamp,
    styleSet,
    webSpeechPonyfill
  })
)(BasicTranscript)
