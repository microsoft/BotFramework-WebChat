import { format } from 'bytes';
import React from 'react';

import connectToWebChat from '../connectToWebChat';
import DownloadIcon from './Assets/DownloadIcon';

export default connectToWebChat(
  ({ language, styleSet }) => ({ language, styleSet })
)(
  ({
    activity: { attachments = [], channelData: { attachmentSizes = [] } = {} },
    attachment,
    language,
    styleSet
  }) => {
    const attachmentIndex = attachments.indexOf(attachment);
    const size = attachmentSizes[attachmentIndex];

    return (
      <div className={ styleSet.downloadAttachment }>
        <a
          href={ attachment.contentUrl }
          target="_blank"
        >
          <div className="details">
            <div className="name">{ attachment.name }</div>
            {
              typeof size === 'number' &&
                <div className="size">{ format(size) }</div>
            }
          </div>
          <DownloadIcon className="icon" language={ language } size={ 1.5 } />
        </a>
      </div>
    );
  }
)
