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
      <div className="details">
        <div>{ attachment.name }</div>
        <div className="url">{ attachment.contentUrl }</div>
      </div>
      <DownloadIcon className="icon" size={ 1.5 } />
    </a>
  </div>
)
