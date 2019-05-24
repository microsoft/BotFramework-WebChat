import { format } from 'bytes';
import PropTypes from 'prop-types';
import React from 'react';

import connectToWebChat from '../connectToWebChat';
import DownloadIcon from './Assets/DownloadIcon';
import { localize } from '../Localization/Localize';

const DownloadAttachment = ({
  activity: { attachments = [], channelData: { attachmentSizes = [] } = {} } = {},
  attachment,
  language,
  styleSet
}) => {
  const attachmentIndex = attachments.indexOf(attachment);
  const label = localize('Download file', language);
  const size = attachmentSizes[attachmentIndex];

  return (
    <div className={styleSet.downloadAttachment}>
      <a href={attachment.contentUrl} rel="noopener noreferrer" target="_blank">
        <div className="details">
          <div className="name">{attachment.name}</div>
          {typeof size === 'number' && <div className="size">{format(size)}</div>}
        </div>
        <DownloadIcon className="icon" label={label} size={1.5} />
      </a>
    </div>
  );
};

DownloadAttachment.propTypes = {
  activity: PropTypes.shape({
    attachment: PropTypes.array,
    channelData: PropTypes.shape({
      attachmentSizes: PropTypes.arrayOf(PropTypes.number)
    })
  }).isRequired,
  attachment: PropTypes.shape({
    contentUrl: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  }).isRequired,
  language: PropTypes.string.isRequired,
  styleSet: PropTypes.shape({
    downloadAttachment: PropTypes.any.isRequired
  }).isRequired
};

export default connectToWebChat(({ language, styleSet }) => ({ language, styleSet }))(DownloadAttachment);
