import { Composer as SayComposer } from 'react-say';
import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';
import { Panel as ScrollToBottomPanel } from 'react-scroll-to-bottom';

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
  webSpeechPonyfill
}) => {
  const { speechSynthesis, SpeechSynthesisUtterance } = webSpeechPonyfill || {};
  const visibleActivities = activities.filter(shouldShowActivity);

  return (
    <div
      className={ classNames(
        ROOT_CSS + '',
        (className || '') + ''
      ) }
      role="log"
    >
      <ScrollToBottomPanel className={ PANEL_CSS + '' }>
        <div className={ FILLER_CSS } />
        <SayComposer
          speechSynthesis={ speechSynthesis }
          speechSynthesisUtterance={ SpeechSynthesisUtterance }
        >
          <ul
            aria-live="polite"
            className={ classNames(LIST_CSS + '', styleSet.activities + '') }
            role="list"
          >
            {
              visibleActivities.map((activity, index) => {
                const showTimestamp = shouldShowTimestamp(activity, visibleActivities[index + 1], groupTimestamp);

                return (
                  <li
                    className={ styleSet.activity }
                    key={ (activity.channelData && activity.channelData.clientActivityID) || activity.id || index }
                    role="listitem"
                  >
                    { activityRenderer({ activity, showTimestamp })(({ attachment }) => attachmentRenderer({ activity, attachment })) }
                    { activity.channelData && activity.channelData.speak && <SpeakActivity activity={ activity } /> }
                  </li>
                );
              })
            }
          </ul>
        </SayComposer>
      </ScrollToBottomPanel>
      <ScrollToEndButton />
    </div>
  );
}

export default connectToWebChat(
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
