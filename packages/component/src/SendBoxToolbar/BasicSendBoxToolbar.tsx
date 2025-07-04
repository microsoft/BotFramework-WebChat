import { hooks, type SendBoxToolbarMiddlewareProps } from 'botframework-webchat-api';
import React, { memo } from 'react';

import UploadButton from './UploadButton';

const { useStyleOptions } = hooks;

function BasicSendBoxToolbar({ className }: SendBoxToolbarMiddlewareProps) {
  const [{ disableFileUpload }] = useStyleOptions();

  return !disableFileUpload && <UploadButton className={className} />;
}

export default memo(BasicSendBoxToolbar);
