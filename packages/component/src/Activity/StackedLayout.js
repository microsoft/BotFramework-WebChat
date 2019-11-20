/* eslint react/no-array-index-key: "off" */

import { Constants } from 'botframework-webchat-core';
import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import remarkStripMarkdown from '../Utils/remarkStripMarkdown';

import Avatar from './Avatar';
import Bubble from './Bubble';
import connectToWebChat from '../connectToWebChat';
import ScreenReaderText from '../ScreenReaderText';
import SendStatus from './SendStatus';
import textFormatToContentType from '../Utils/textFormatToContentType';
import Timestamp from './Timestamp';
import useAvatarForBot from '../hooks/useAvatarForBot';
import useAvatarForUser from '../hooks/useAvatarForUser';
import useLocalize from '../hooks/useLocalize';
import useLocalizeDate from '../hooks/useLocalizeDate';
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

const StackedLayout = ({ activity, children, timestampClassName }) => {
  const [{ initials: botInitials }] = useAvatarForBot();
  const [{ initials: userInitials }] = useAvatarForUser();
  const [{ botAvatarInitials, bubbleNubSize, bubbleFromUserNubSize, userAvatarInitials }] = useStyleOptions();
  const [{ stackedLayout: stackedLayoutStyleSet }] = useStyleSet();

  const {
    attachments = [],
    channelData: { messageBack: { displayText: messageBackDisplayText } = {}, state } = {},
    from: { role } = {},
    text,
    textFormat,
    timestamp
  } = activity;

  const activityDisplayText = messageBackDisplayText || text;
  const fromUser = role === 'user';
  const initials = fromUser ? userInitials : botInitials;
  const showSendStatus = state === SENDING || state === SEND_FAILED;
  const plainText = remarkStripMarkdown(text);
  const indented = fromUser ? bubbleFromUserNubSize : bubbleNubSize;

  const botRoleLabel = useLocalize('BotSent');
  const userRoleLabel = useLocalize('UserSent');

  const roleLabel = fromUser ? botRoleLabel : userRoleLabel;

  const botAriaLabel = useLocalize('Bot said something', initials, plainText);
  const userAriaLabel = useLocalize('User said something', initials, plainText);
  const sentAtTimestamp = useLocalize('SentAt') + useLocalizeDate(timestamp);

  const someoneSaidString = (fromUser ? userAriaLabel : botAriaLabel).trim();

  const ariaLabel = someoneSaidString + (someoneSaidString.endsWith('.') ? '' : '.') + ' ' + sentAtTimestamp;

  return (
    <div
      className={classNames(ROOT_CSS + '', stackedLayoutStyleSet + '', {
        'from-user': fromUser,
        webchat__stacked_extra_left_indent: fromUser && !botAvatarInitials && bubbleNubSize,
        webchat__stacked_extra_right_indent: !fromUser && !userAvatarInitials && bubbleFromUserNubSize,
        webchat__stacked_indented_content: initials && !indented
      })}
    >
      {!initials && !!(fromUser ? bubbleFromUserNubSize : bubbleNubSize) && <div className="avatar" />}
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
        {attachments.map((attachment, index) => (
          // Because of differences in browser implementations, aria-label=" " is used to make the screen reader not repeat the same text multiple times in Chrome v75 and Edge 44
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
  children: PropTypes.any,
  timestampClassName: PropTypes.string
};

export default StackedLayout;

export { connectStackedLayout };
