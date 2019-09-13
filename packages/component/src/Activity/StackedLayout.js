/* eslint react/no-array-index-key: "off" */
/* eslint-disable no-sync */

import { Constants } from 'botframework-webchat-core';
import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import remark from 'remark';
import stripMarkdown from 'strip-markdown';

import Avatar from './Avatar';
import Bubble from './Bubble';
import connectToWebChat from '../connectToWebChat';
import ScreenReaderText from '../ScreenReaderText';
import SendStatus from './SendStatus';
import textFormatToContentType from '../Utils/textFormatToContentType';
import Timestamp from './Timestamp';
import useLocalize from '../hooks/useLocalize';
import useStyleOptions from '../hooks/useStyleOptions';
import useStyleSet from '../hooks/useStyleSet';

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

const connectStackedLayout = (...selectors) => {
  console.warn(
    'Web Chat: connectStackedLayout() will be removed on or after 2021-09-27, please use useStackedLayout() instead.'
  );

  return connectToWebChat(
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
};

const useStackedLayout = ({ fromUser }) => {
  const { botAvatarInitials, userAvatarInitials } = useStyleOptions();

  return {
    avatarInitials: fromUser ? userAvatarInitials : botAvatarInitials
  };
};

const StackedLayout = ({ activity, children, timestampClassName }) => {
  const { from: { role } = {}, text } = activity;
  const fromUser = role === 'user';
  const { avatarInitials } = useStackedLayout({ fromUser });
  const styleSet = useStyleSet();
  const plainText = useMemo(
    () =>
      remark()
        .use(stripMarkdown)
        .processSync(text),
    [text]
  );
  const ariaLabel = useLocalize(fromUser ? 'User said something' : 'Bot said something', avatarInitials, plainText);
  const roleLabel = useLocalize(fromUser ? 'UserSent' : 'BotSent');

  const {
    attachments = [],
    channelData: { messageBack: { displayText: messageBackDisplayText } = {}, state } = {},
    textFormat
  } = activity;

  const activityDisplayText = messageBackDisplayText || text;
  const showSendStatus = state === SENDING || state === SEND_FAILED;
  const indented = fromUser ? styleSet.options.bubbleFromUserNubSize : styleSet.options.bubbleNubSize;

  return (
    <div
      className={classNames(ROOT_CSS + '', styleSet.stackedLayout + '', {
        'from-user': fromUser,
        webchat__stacked_extra_left_indent:
          fromUser && !styleSet.options.botAvatarInitials && styleSet.options.bubbleNubSize,
        webchat__stacked_extra_right_indent:
          !fromUser && !styleSet.options.userAvatarInitials && styleSet.options.bubbleFromUserNubSize,
        webchat__stacked_indented_content: avatarInitials && !indented
      })}
    >
      {!avatarInitials && !!(fromUser ? styleSet.options.bubbleFromUserNubSize : styleSet.options.bubbleNubSize) && (
        <div className="avatar" />
      )}
      <Avatar aria-hidden={true} className="avatar" fromUser={fromUser} />
      <div className="content">
        {!!activityDisplayText && (
          <div className="webchat__row message">
            <ScreenReaderText text={ariaLabel} />
            <Bubble aria-hidden={true} className="bubble" fromUser={fromUser} nub={true}>
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
        )}
        {/* Because of differences in browser implementations, aria-label=" " is used to make the screen reader not repeat the same text multiple times in Chrome v75 */}
        {attachments.map((attachment, index) => (
          <div
            aria-label=" "
            className={classNames('webchat__row attachment', { webchat__stacked_item_indented: indented })}
            key={index}
          >
            <ScreenReaderText text={roleLabel} />
            <Bubble className="attachment bubble" fromUser={fromUser} key={index} nub={false}>
              {children({ attachment })}
            </Bubble>
          </div>
        ))}
        <div className={classNames('webchat__row', { webchat__stacked_item_indented: indented })}>
          {showSendStatus ? (
            <SendStatus activity={activity} className="timestamp" />
          ) : (
            <Timestamp activity={activity} className={classNames('timestamp', timestampClassName)} />
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
  children: PropTypes.any,
  timestampClassName: PropTypes.string
};

export default StackedLayout;

export { connectStackedLayout, useStackedLayout };
