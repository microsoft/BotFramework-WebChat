import React from 'react';

import { withStyleSet } from '../Context';
import DownloadIcon from './Assets/DownloadIcon';

export default withStyleSet(({ attachment, styleSet }) =>
  <div className={ styleSet.downloadAttachment }>
    <a
      href={ attachment.contentUrl }
      target="_blank"
      title={ attachment.contentUrl }
    >
      <DownloadIcon className="icon" />
      <div className="details">
        <div>{ attachment.name }</div>
        <div className="url">{ attachment.contentUrl }</div>
      </div>
    </a>
  </div>
)
