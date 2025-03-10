import { hooks, type SendBoxToolbarMiddlewareProps } from 'botframework-webchat-api';
import React, { memo } from 'react';

import UploadButton from './UploadButton';

const { useStyleOptions } = hooks;

function BasicSendBoxToolbar({ className }: SendBoxToolbarMiddlewareProps) {
  const [{ hideUploadButton }] = useStyleOptions();

  return !hideUploadButton && <UploadButton className={className} />;
}

export default memo(BasicSendBoxToolbar);
