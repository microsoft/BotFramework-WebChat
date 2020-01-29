import PropTypes from 'prop-types';
import React from 'react';

import FileContent from './FileContent';
import useStyleSet from '../hooks/useStyleSet';

const FileAttachment = ({
  activity: { attachments = [], channelData: { attachmentSizes = [] } = {} } = {},
  attachment
}) => {
  const [{ fileAttachment: fileAttachmentStyleSet }] = useStyleSet();
  const attachmentIndex = attachments.indexOf(attachment);
  const size = attachmentSizes[attachmentIndex];

  return (
    <FileContent
      className={fileAttachmentStyleSet + ''}
      fileName={attachment.name}
      href={attachment.contentUrl}
      size={size}
    />
  );
};

FileAttachment.propTypes = {
  activity: PropTypes.shape({
    attachment: PropTypes.array,
    channelData: PropTypes.shape({
      attachmentSizes: PropTypes.arrayOf(PropTypes.number)
    })
  }).isRequired,
  attachment: PropTypes.shape({
    contentUrl: PropTypes.string,
    name: PropTypes.string.isRequired
  }).isRequired
};

export default FileAttachment;
