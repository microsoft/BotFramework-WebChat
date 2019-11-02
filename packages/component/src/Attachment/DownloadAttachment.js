import { format } from 'bytes';
import PropTypes from 'prop-types';
import React from 'react';

import DownloadIcon from './Assets/DownloadIcon';
import ScreenReaderText from '../ScreenReaderText';
import useLocalize from '../hooks/useLocalize';
import useStyleSet from '../hooks/useStyleSet';

const DownloadAttachment = ({
  activity: { attachments = [], channelData: { attachmentSizes = [] } = {} } = {},
  attachment
}) => {
  const [{ downloadAttachment: downloadAttachmentStyleSet }] = useStyleSet();
  const downloadLabel = useLocalize('Download file');

  const attachmentIndex = attachments.indexOf(attachment);
  const size = attachmentSizes[attachmentIndex];
  const formattedSize = typeof size === 'number' && format(size);

  const downloadFileWithFileSizeLabel = useLocalize(
    'DownloadFileWithFileSize',
    downloadLabel,
    attachment.name,
    formattedSize
  );

  return (
    <React.Fragment>
      <ScreenReaderText text={downloadFileWithFileSizeLabel} />
      <div aria-hidden={true} className={downloadAttachmentStyleSet}>
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
  }).isRequired
};

export default DownloadAttachment;
