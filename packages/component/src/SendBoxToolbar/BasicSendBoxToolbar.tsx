import { hooks, type SendBoxToolbarMiddlewareProps } from 'botframework-webchat-api';
import React, { memo } from 'react';

import UploadButton from './UploadButton';

const { useStyleOptions } = hooks;

// NOTE: "hideUploadButton" is deprecated. Use "disableFileUpload" instead.
//       Rectification logic is handled in patchStyleOptionsFromDeprecatedProps.js
function BasicSendBoxToolbar({ className }: SendBoxToolbarMiddlewareProps) {
  const [{ disableFileUpload }] = useStyleOptions();

  return !disableFileUpload && <UploadButton className={className} />;
}

export default memo(BasicSendBoxToolbar);
