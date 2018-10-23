import { format } from 'bytes';
import React from 'react';

import connectWithContext from '../connectWithContext';
import DownloadIcon from './Assets/DownloadIcon';

export default connectWithContext(
  ({ styleSet }) => ({ styleSet })
)(
  ({
    activity: { attachments = [], channelData: { attachmentSizes = [] } = {} },
    attachment,
    styleSet
  }) => {
    const attachmentIndex = attachments.indexOf(attachment);
    const size = attachmentSizes[attachmentIndex];

    return (
      <div className={ styleSet.downloadAttachment }>
        <a
          href={ attachment.contentUrl }
          target="_blank"
          title={ attachment.contentUrl }
        >
          <div className="details">
            <div className="name">{ attachment.name }</div>
            {
              typeof size === 'number' &&
                <div className="size">{ format(size) }</div>
            }
          </div>
          <DownloadIcon className="icon" size={ 1.5 } />
        </a>
      </div>
    );
  }
)
