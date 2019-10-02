import { format } from 'bytes';
import PropTypes from 'prop-types';
import React from 'react';

import { localize } from '../Localization/Localize';
import connectToWebChat from '../connectToWebChat';
import DownloadIcon from './Assets/DownloadIcon';
import ScreenReaderText from '../ScreenReaderText';

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
    <React.Fragment>
      <ScreenReaderText text={downloadFileWithFileSizeLabel} />
      <div aria-hidden={true} className={styleSet.downloadAttachment}>
        <a href={attachment.contentUrl} rel="noopener noreferrer" target="_blank">
          {/* Although nested, Chrome v75 does not respect the above aria-hidden and makes the below aria-hidden necessary */}
          <div aria-hidden={true} className="details">
            <div className="name">{attachment.name}</div>
            <div className="size">{formattedSize}</div>
          </div>
          <DownloadIcon className="icon" size={1.5} />
        </a>
      </div>
    </React.Fragment>
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
