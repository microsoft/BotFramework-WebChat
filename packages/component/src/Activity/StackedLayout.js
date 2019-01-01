import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import { Constants } from 'botframework-webchat-core';

import { localize } from '../Localization/Localize';
import Avatar from './Avatar';
import Bubble from './Bubble';
import connectToWebChat from '../connectToWebChat';
import SendStatus from './SendStatus';
import textFormatToContentType from '../Utils/textFormatToContentType';
import Timestamp from './Timestamp';

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
    language,
    styleSet: {
      options: {
        botAvatarInitials,
        userAvatarInitials
      }
    }
  }, { activity }) => ({
    avatarInitials: activity.from && activity.from.role === 'user' ? userAvatarInitials : botAvatarInitials,
    language,

    // TODO: [P4] We want to deprecate botAvatarInitials/userAvatarInitials because they are not as helpful as avatarInitials
    botAvatarInitials,
    userAvatarInitials
  }),
  ...selectors
);

export default connectStackedLayout(
  ({
    avatarInitials,
    language,
    direction,
    styleSet
  }) => ({
    avatarInitials,
    language,
    direction,
    styleSet
  })
)(
  ({
    activity,
    avatarInitials,
    children,
    language,
    direction,
    showTimestamp,
    styleSet
  }) => {
    const fromUser = activity.from.role === 'user';
    const { state } = activity.channelData || {};
    const showSendStatus = state === SENDING || state === SEND_FAILED;
    const ariaLabel = localize(fromUser ? 'User said something' : 'Bot said something', language, avatarInitials, activity.text, activity.timestamp);

    return (
      <div
        className={ classNames(
          ROOT_CSS + '',
          styleSet.stackedLayout + '',
          { 'from-user': fromUser },
          direction
        ) }
      >
        <Avatar
          aria-hidden={ true }
          className="avatar"
          fromUser={ fromUser }
        />
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
                  aria-label={ ariaLabel }
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
              <div
                aria-hidden={ true }
                className="row"
              >
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
