import { css } from 'glamor';
import React from 'react';

import Avatar from './Avatar';
import Bubble from './Bubble';
import Text from './Renderer/Text';

const ROOT_CSS = css({
  display: 'flex',
  padding: 20
});

const BUBBLE_CSS = css({
  flex: 1,
  marginLeft: 10
});

export default props =>
  <div className={ ROOT_CSS }>
    <Avatar />
    <Bubble
      className={ BUBBLE_CSS }
      timestamp="1 min ago"
    >
      <Text value="This is an activity" />
    </Bubble>
  </div>
