import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import { Constants } from 'botframework-webchat-core';

import Avatar from './Avatar';
import Bubble from './Bubble';
import SendStatus from './SendStatus';
import Timestamp from './Timestamp';

import connectToWebChat from '../connectToWebChat';
import textFormatToContentType from '../Utils/textFormatToContentType';

const { ActivityClientState: { SENDING, SEND_FAILED } } = Constants;

const ROOT_CSS = css({
  display: 'flex',

  '& > .avatar': {
    flexShrink: 0
  },

  '& > .content': {
    flexGrow: 1,
    overflow: 'hidden',

    '& > .row': {
      display: 'flex',

      '& > .bubble, & > .timestamp': {
        flexGrow: 1,
        overflow: 'hidden'
      },

      '& > .filler': {
        flexGrow: 10000,
        flexShrink: 1
      }
    }
  },

  '& > .filler': {
    flexShrink: 0
  },

  '&.from-user': {
    flexDirection: 'row-reverse',

    '& > .content > .row': {
      flexDirection: 'row-reverse'
    }
  }
});

const connectStackedLayout = (...selectors) => connectToWebChat(
  ({
    botAvatarInitials,
    language,
    userAvatarInitials
  }) => ({
    botAvatarInitials,
    language,
    userAvatarInitials
  }),
  ...selectors
);

export default connectStackedLayout(
  ({ styleSet }) => ({ styleSet })
)(
  ({
    activity,
    botAvatarInitials,
    children,
    showTimestamp,
    styleSet,
    userAvatarInitials
  }) => {
    const fromUser = activity.from.role === 'user';
    const initials = fromUser ? userAvatarInitials : botAvatarInitials;
    const { state } = activity.channelData || {};
    const showSendStatus = state === SENDING || state === SEND_FAILED;

    return (
      <div
        className={ classNames(
          ROOT_CSS + '',
          styleSet.stackedLayout + '',
          { 'from-user': fromUser }
        ) }
      >
        { !!initials &&
          <Avatar className="avatar" fromUser={ fromUser }>{ initials }</Avatar>
        }
        <div className="content">
          {
            activity.type === 'typing' ?
              <div className="row typing">
                {
                  children({
                    activity,
                    attachment: { contentType: 'typing' }
                  })
                }
                <div className="filler" />
              </div>
            : !!activity.text &&
              <div className="row message">
                <Bubble
                  className="bubble"
                  fromUser={ fromUser }
                >
                  {
                    children({
                      activity,
                      attachment: {
                        contentType: textFormatToContentType(activity.textFormat),
                        content: activity.text
                      }
                    })
                  }
                </Bubble>
                <div className="filler" />
              </div>
          }
          {
            (activity.attachments || []).map((attachment, index) =>
              <div className="row attachment" key={ index }>
                <Bubble
                  className="attachment bubble"
                  fromUser={ fromUser }
                  key={ index }
                >
                  { children({ attachment }) }
                </Bubble>
              </div>
            )
          }
          {
            (showSendStatus || showTimestamp) &&
              <div className="row">
                { showSendStatus ?
                    <SendStatus activity={ activity } className="timestamp" />
                  :
                    <Timestamp activity={ activity } className="timestamp" />
                }
                <div className="filler" />
              </div>
          }
        </div>
        <div className="filler" />
      </div>
    );
  }
)

export { connectStackedLayout }
