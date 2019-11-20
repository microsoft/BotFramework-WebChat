import { css } from 'glamor';
import { format } from 'bytes';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import ScreenReaderText from '../ScreenReaderText';
import useLocalize from '../hooks/useLocalize';
import useStyleSet from '../hooks/useStyleSet';

const ROOT_CSS = css({
  display: 'flex',
  flexDirection: 'column'
});

const UploadAttachment = ({
  activity: { attachments = [], channelData: { attachmentSizes = [] } = {} } = {},
  attachment
}) => {
  const [{ uploadAttachment: uploadAttachmentStyleSet }] = useStyleSet();

  const attachmentIndex = attachments.indexOf(attachment);
  const uploadLabel = useLocalize('Upload file');
  const size = attachmentSizes[attachmentIndex];
  const formattedSize = typeof size === 'number' && format(size);
  const uploadFileWithFileSizeLabel = useLocalize(
    'UploadFileWithFileSize',
    uploadLabel,
    attachment.name,
    formattedSize
  );

  return (
    <React.Fragment>
      <ScreenReaderText text={uploadFileWithFileSizeLabel} />
      <div aria-hidden={true} className={classNames(ROOT_CSS + '', uploadAttachmentStyleSet + '')}>
        <div className="name">{attachment.name}</div>
        <div className="size">{formattedSize}</div>
      </div>
    </React.Fragment>
  );
};

UploadAttachment.propTypes = {
  activity: PropTypes.shape({
    attachment: PropTypes.array,
    channelData: PropTypes.shape({
      attachmentSizes: PropTypes.arrayOf(PropTypes.number)
    })
  }).isRequired,
  attachment: PropTypes.shape({
    name: PropTypes.string.isRequired
  }).isRequired
};

export default UploadAttachment;
