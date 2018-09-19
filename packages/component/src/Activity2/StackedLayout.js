import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import { Constants } from 'backend';

import Avatar from './Avatar';
import Bubble from './Bubble';
import Context from '../Context';
import SendStatus from './SendStatus';
import Timestamp from './Timestamp';

import textFormatToContentType from '../Utils/textFormatToContentType';

const { SendState: { SENDING, SEND_FAILED } } = Constants;

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

const StackedLayout = ({
  activity,
  botAvatarInitials,
  children,
  showTimestamp,
  styleSet,
  userAvatarInitials,
}) => {
  const initials = activity.from.role === 'user' ? userAvatarInitials : botAvatarInitials;
  const { sendState } = activity.channelData || {};
  const showSendStatus = sendState === SENDING || sendState === SEND_FAILED;

  return (
    <div className={ classNames(
      ROOT_CSS + '',
      styleSet.stackedLayout + '',
      { 'from-user': activity.from.role === 'user' }
    ) }>
      { !!initials &&
        <Avatar className="avatar">{ initials }</Avatar>
      }
      <div className="content">
        {
          activity.type === 'typing' ?
            <div className="row typing">
              { children({
                activity,
                attachment: { contentType: 'typing' }
              }) }
              <div className="filler" />
            </div>
          : !!activity.text &&
            <div className="row message">
              <Bubble
                className="bubble"
                fromUser={ activity.from.role === 'user' }
              >
                { children({
                  activity,
                  attachment: {
                    contentType: textFormatToContentType(activity.textFormat),
                    content: activity.text
                  }
                }) }
              </Bubble>
              <div className="filler" />
            </div>
        }
        {
          (activity.attachments || []).map((attachment, index) =>
            <div className="row attachment" key={ index }>
              <Bubble
                className="attachment bubble"
                fromUser={ activity.from.role === 'user' }
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

export default ({ children, ...props }) =>
  <Context.Consumer>
    { ({
        botAvatarInitials,
        styleSet,
        userAvatarInitials
      }) =>
      <StackedLayout
        { ...props }
        botAvatarInitials={ botAvatarInitials }
        styleSet={ styleSet }
        userAvatarInitials={ userAvatarInitials }
      >
        { children }
      </StackedLayout>
    }
  </Context.Consumer>
