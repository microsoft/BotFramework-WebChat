import React from 'react';

import FileContent from './FileContent';

const FileAttachment = ({
  activity: { attachments = [], channelData: { attachmentSizes = [] } = {} } = {},
  attachment
}) => {
  const attachmentIndex = attachments.indexOf(attachment);
  const size = attachmentSizes[+attachmentIndex];

  return <FileContent fileName={attachment.name} href={attachment.contentUrl} size={size} />;
};

export default FileAttachment;
