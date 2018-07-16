import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import { withActivity } from './Context';
import { withStyleSet } from '../Context';
import Avatar from './Avatar';
import Bubble from './Bubble';
import TimeAgo from './TimeAgo';

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

export default withStyleSet(withActivity(({ activity: { cards: [card], from }, children, styleSet }) =>
  <div className={ classNames(ROOT_CSS + '', styleSet.singleCardActivity + '', { 'from-user': from === 'user' }) }>
    <Avatar className={ AVATAR_CSS } />
    <div className="bubble-box">
      <Bubble>
        { !!children && children(card) }
      </Bubble>
      <TimeAgo />
    </div>
    <div className="filler" />
  </div>
))
