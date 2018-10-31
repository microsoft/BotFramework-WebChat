import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import connectToWebChat from '../connectToWebChat';
import VideoContent from './VideoContent';

const ROOT_CSS = css({
  display: 'flex',
  flexDirection: 'column'
});

export default connectToWebChat(
  ({ styleSet }) => ({ styleSet })
)(
  ({ attachment, styleSet }) =>
    <div className={ classNames(
      ROOT_CSS + '',
      styleSet.videoAttachment
    ) }>
      <VideoContent
        alt={ attachment.name }
        src={ attachment.contentUrl }
      />
    </div>
)
