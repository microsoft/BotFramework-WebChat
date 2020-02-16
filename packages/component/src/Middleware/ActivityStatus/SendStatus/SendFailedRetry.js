import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import InlineMarkdown from '../../../Utils/InlineMarkdown';
import useLocalizer from '../../../hooks/useLocalizer';

const MARKDOWN_REFERENCES = ['RETRY'];

const SendFailedRetry = ({ onRetryClick }) => {
  const handleReference = useCallback(({ data }) => data === 'RETRY' && onRetryClick(), [onRetryClick]);
  const localize = useLocalizer();

  const sendFailedText = localize('ACTIVITY_STATUS_SEND_FAILED_RETRY');

  return (
    <InlineMarkdown onReference={handleReference} references={MARKDOWN_REFERENCES}>
      {sendFailedText}
    </InlineMarkdown>
  );
};

SendFailedRetry.propTypes = {
  onRetryClick: PropTypes.func.isRequired
};

export default SendFailedRetry;
