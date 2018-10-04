import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import VideoContent from './VideoContent';
import { withStyleSet } from '../Context';

const ROOT_CSS = css({
  display: 'flex',
  flexDirection: 'column'
});

export default withStyleSet(({ attachment, styleSet }) =>
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
