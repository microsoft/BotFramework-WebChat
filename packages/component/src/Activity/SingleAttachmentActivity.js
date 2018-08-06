import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import { withActivity } from './Context';
import Avatar from './Avatar';
import Bubble from './Bubble';
import TimeAgo from './TimeAgo';

import MainContext from '../Context';

const ROOT_CSS = css({
  display: 'flex',

  '&.from-user': {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-end'
  },

  '& > .bubble-box': {
    flexGrow: 10000,
    overflow: 'hidden'
  },

  '& > .filler': {
    flexGrow: 1,
    flexShrink: 10000
  }
});

const AVATAR_CSS = css({
  flexShrink: 0
});

export default withActivity(({
  activity: { from },
  attachments: [attachment],
  children
}) =>
  <MainContext>
    { ({ styleSet, userID }) =>
      <div className={ classNames(
        ROOT_CSS + '',
        styleSet.singleAttachmentActivity + '',
        { 'from-user': from && from.id === userID }
      ) }>
        <Avatar className={ AVATAR_CSS } />
        <div className="bubble-box">
          <Bubble>
            { !!children && (typeof children === 'function' ? children(attachment) : children) }
          </Bubble>
          <TimeAgo />
        </div>
        <div className="filler" />
      </div>
    }
  </MainContext>
)
