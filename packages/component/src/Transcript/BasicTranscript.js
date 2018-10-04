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

const BasicTranscript = ({
  activityRenderer,
  activities,
  attachmentRenderer,
  className,
  groupTimestamp,
  styleSet,
  webSpeechPonyfill: { speechSynthesis, SpeechSynthesisUtterance } = {}
}) =>
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
          activities.map((activity, index) => {
            if (activity.channelData && activity.channelData.postBack) {
              return false;
            }

            const nextActivity = activities[index + 1];
            let showTimestamp = true;

            if (groupTimestamp !== false) {
              groupTimestamp = typeof groupTimestamp === 'number' ? groupTimestamp : 5 * 60 * 1000;

              if (activity.type !== 'message') {
                // Hide timestamp for typing
                showTimestamp = false;
              } else if (nextActivity && activity.from.role === nextActivity.from.role) {
                const time = new Date(activity.timestamp).getTime();
                const nextTime = new Date(nextActivity.timestamp).getTime();

                showTimestamp = (nextTime - time) > groupTimestamp;
              }
            }

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

export default connectWithContext(
  ({ activities }) => ({ activities }),
  ({
    activityRenderer,
    attachmentRenderer,
    groupTimestamp,
    styleSet,
    webSpeechPonyfill
  }) => ({
    activityRenderer,
    attachmentRenderer,
    groupTimestamp,
    styleSet,
    webSpeechPonyfill
  })
)(BasicTranscript)
