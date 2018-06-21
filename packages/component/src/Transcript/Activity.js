import { css } from 'glamor';
import React from 'react';

import Avatar from './Avatar';
import Bubble from './Bubble';

const ROOT_CSS = css({
  display: 'flex',
  padding: 10,

  '& > .filler': {
    width: 50
  }
});

const AVATAR_CSS = css({
  flexShrink: 0
});

const BUBBLE_CSS = css({
  flex: 1,
  marginLeft: 10,
  overflow: 'hidden'
});

export default props =>
  <div className={ ROOT_CSS }>
    <Avatar
      className={ AVATAR_CSS }
    />
    <Bubble
      className={ BUBBLE_CSS }
      image={ props.attachment }
      timestamp={ props.timestamp }
    >
      { props.children }
    </Bubble>
    <div className="filler" />
  </div>
