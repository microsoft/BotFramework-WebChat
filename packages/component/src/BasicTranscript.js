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
  listStyleType: 'none',

  '& > li:first-child, & > li .transcript-timestamp': {
    display: 'none'
  },

  '& > li.timestamp-group-a + li.timestamp-group-b, & > li.timestamp-group-b + li.timestamp-group-a': {
    '& .transcript-timestamp': {
      display: 'initial'
    }
  }
});

function shouldShowActivity(activity) {
  if (activity) {
    if (activity.type === 'message') {
      const { attachments = [], text } = activity;

      if (
        // Do not show postback
        !(activity.channelData && activity.channelData.postBack)
        // Do not show messageBack if displayText is undefined
        && !(activity.channelData && activity.channelData.messageBack && !activity.channelData.messageBack.displayText)
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

function sameTimestampGroup(activityX, activityY, groupTimestamp) {
  if (groupTimestamp === false) {
    return true;
  } else if (activityX && activityY) {
    groupTimestamp = typeof groupTimestamp === 'number' ? groupTimestamp : 5 * 60 * 1000;

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
  let lastGroupID = 0;

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
            {/*
              This empty <li> element is to offset the timestamp grouping calculation for the first bubble.
              Omitting this hidden <li> will cause the first bubble to hide its timestamp.
            */}
            <li aria-hidden={ true } className="timestamp-group-a" role="presentation" />
            {
              activities.map((activity, index) => {
                if (!sameTimestampGroup(activity, activities[index + 1], groupTimestamp)) {
                  lastGroupID = (lastGroupID + 1) % 2;
                }

                return (
                  <li
                    className={ classNames(
                      styleSet.activity + '',
                      {
                        'timestamp-group-a': !lastGroupID,
                        'timestamp-group-b': lastGroupID
                      }
                    ) }
                    key={ (activity.channelData && activity.channelData.clientActivityID) || activity.id || index }
                    role="listitem"
                  >
                    {
                      activityRenderer({
                        activity,
                        timestampClassName: 'transcript-timestamp'
                      })(
                        ({ attachment }) => attachmentRenderer({ activity, attachment })
                      )
                    }
                    {
                      // TODO: [P2] We should use core/definitions/speakingActivity for this predicate instead
                      activity.channelData && activity.channelData.speak && <SpeakActivity activity={ activity } />
                    }
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
