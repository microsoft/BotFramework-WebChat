import { css } from 'glamor';
import { format } from 'bytes';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import { localize } from '../Localization/Localize';
import connectToWebChat from '../connectToWebChat';
import ScreenReaderText from '../ScreenReaderText';

const ROOT_CSS = css({
  display: 'flex',
  flexDirection: 'column'
});

const UploadAttachment = ({
  activity: { attachments = [], channelData: { attachmentSizes = [] } = {} } = {},
  attachment,
  language,
  styleSet
}) => {
  const attachmentIndex = attachments.indexOf(attachment);
  const size = attachmentSizes[attachmentIndex];
  const formattedSize = typeof size === 'number' && format(size);
  const uploadFileWithFileSizeLabel = localize('UploadFileWithFileSize', language, attachment.name, formattedSize);
  return (
    <React.Fragment>
      <ScreenReaderText text={uploadFileWithFileSizeLabel} />
      <div aria-hidden={true} className={classNames(ROOT_CSS + '', styleSet.uploadAttachment + '')}>
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
  }).isRequired,
  language: PropTypes.string.isRequired,
  styleSet: PropTypes.shape({
    downloadAttachment: PropTypes.any.isRequired
  }).isRequired
};

export default connectToWebChat(({ language, styleSet }) => ({ language, styleSet }))(UploadAttachment);
