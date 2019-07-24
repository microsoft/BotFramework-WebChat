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
  const downloadLabel = localize('Download file', language);
  const size = attachmentSizes[attachmentIndex];
  const formattedSize = typeof size === 'number' && format(size);
  const downloadFileWithFileSizeLabel = localize(
    'DownloadFileWithFileSize',
    language,
    downloadLabel,
    attachment.name,
    formattedSize
  );
  return (
    <div aria-label={downloadFileWithFileSizeLabel} className={styleSet.downloadAttachment}>
      <a aria-hidden={true} href={attachment.contentUrl} rel="noopener noreferrer" target="_blank">
        <div className="details">
          <div className="name">{attachment.name}</div>
          <div className="size">{formattedSize}</div>
        </div>
        <DownloadIcon className="icon" size={1.5} />
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
