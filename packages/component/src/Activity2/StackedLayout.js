import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import Avatar from './Avatar';
import Bubble from './Bubble';
import Context from '../Context';
import Timestamp from './Timestamp';

import textFormatToContentType from '../Utils/textFormatToContentType';

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
              <Bubble className="bubble">
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
              <Bubble className="attachment bubble" key={ index }>
                { children({ attachment }) }
              </Bubble>
            </div>
          )
        }
        {
          showTimestamp &&
            <div className="row">
              <Timestamp activity={ activity } className="timestamp" />
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
