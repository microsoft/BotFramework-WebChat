/* eslint react/no-array-index-key: "off" */

import { Constants } from 'botframework-webchat-core';
import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import { localize } from '../Localization/Localize';
import Avatar from './Avatar';
import Bubble from './Bubble';
import connectToWebChat from '../connectToWebChat';
import SendStatus from './SendStatus';
import textFormatToContentType from '../Utils/textFormatToContentType';
import Timestamp from './Timestamp';

const {
  ActivityClientState: { SENDING, SEND_FAILED }
} = Constants;

const ROOT_CSS = css({
  display: 'flex',

  '& > .avatar': {
    flexShrink: 0
  },

  '& > .content': {
    flexGrow: 1,
    overflow: 'hidden',

    '& > .webchat__row': {
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

    '& > .content > .webchat__row': {
      flexDirection: 'row-reverse'
    }
  }
});

const connectStackedLayout = (...selectors) =>
  connectToWebChat(
    (
      {
        language,
        styleSet: {
          options: { botAvatarInitials, userAvatarInitials }
        }
      },
      { activity: { from: { role } = {} } = {} }
    ) => ({
      avatarInitials: role === 'user' ? userAvatarInitials : botAvatarInitials,
      language,

      // TODO: [P4] We want to deprecate botAvatarInitials/userAvatarInitials because they are not as helpful as avatarInitials
      botAvatarInitials,
      userAvatarInitials
    }),
    ...selectors
  );

const StackedLayout = ({ activity, avatarInitials, children, language, styleSet, timestampClassName }) => {
  const {
    attachments = [],
    channelData: { messageBack: { displayText: messageBackDisplayText } = {}, state } = {},
    from: { role } = {},
    text,
    textFormat,
    type
  } = activity;

  const fromUser = role === 'user';
  const showSendStatus = state === SENDING || state === SEND_FAILED;
  const ariaLabel = localize(fromUser ? 'User said something' : 'Bot said something', language, avatarInitials, text);
  const activityDisplayText = messageBackDisplayText || text;

  return (
    <div className={classNames(ROOT_CSS + '', styleSet.stackedLayout + '', { 'from-user': fromUser })}>
      <Avatar aria-hidden={true} className="avatar" fromUser={fromUser} />
      <div className="content">
        {type === 'typing' ? (
          <div className="webchat__row typing">
            {children({
              activity,
              attachment: { contentType: 'typing' }
            })}
            <div className="filler" />
          </div>
        ) : (
          !!activityDisplayText && (
            <div aria-label={ariaLabel} className="webchat__row message">
              <Bubble aria-hidden={true} className="bubble" fromUser={fromUser}>
                {children({
                  activity,
                  attachment: {
                    content: activityDisplayText,
                    contentType: textFormatToContentType(textFormat)
                  }
                })}
              </Bubble>
              <div className="filler" />
            </div>
          )
        )}
        {attachments.map((attachment, index) => (
          <div className="webchat__row attachment" key={index}>
            <Bubble aria-hidden={true} className="attachment bubble" fromUser={fromUser} key={index}>
              {children({ attachment })}
            </Bubble>
          </div>
        ))}
        <div className="webchat__row">
          {showSendStatus ? (
            <SendStatus activity={activity} className="timestamp" />
          ) : (
            <Timestamp activity={activity} aria-hidden={true} className={classNames('timestamp', timestampClassName)} />
          )}
          <div className="filler" />
        </div>
      </div>
      <div className="filler" />
    </div>
  );
};

StackedLayout.defaultProps = {
  children: undefined,
  timestampClassName: ''
};

StackedLayout.propTypes = {
  activity: PropTypes.shape({
    attachments: PropTypes.array,
    channelData: PropTypes.shape({
      messageBack: PropTypes.shape({
        displayText: PropTypes.string
      })
    }),
    from: PropTypes.shape({
      role: PropTypes.string.isRequired
    }).isRequired,
    text: PropTypes.string,
    textFormat: PropTypes.string,
    timestamp: PropTypes.string,
    type: PropTypes.string.isRequired
  }).isRequired,
  avatarInitials: PropTypes.string.isRequired,
  children: PropTypes.any,
  language: PropTypes.string.isRequired,
  styleSet: PropTypes.shape({
    stackedLayout: PropTypes.any.isRequired
  }).isRequired,
  timestampClassName: PropTypes.string
};

export default connectStackedLayout(({ avatarInitials, language, styleSet }) => ({
  avatarInitials,
  language,
  styleSet
}))(StackedLayout);

export { connectStackedLayout };
