import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useLocalizer } from 'botframework-webchat-api/hook.js';
import React, { useCallback } from 'react';
import { function_, object, pipe, readonly, type InferInput } from 'valibot';

import InlineMarkdown from '../../../Utils/InlineMarkdown';

const MARKDOWN_REFERENCES = ['RETRY'];

const sendFailedRetryPropsSchema = pipe(
  object({
    onRetryClick: function_()
  }),
  readonly()
);

type SendFailedRetryProps = InferInput<typeof sendFailedRetryPropsSchema>;

const SendFailedRetry = (props: SendFailedRetryProps) => {
  const { onRetryClick } = validateProps(sendFailedRetryPropsSchema, props);

  const handleReference = useCallback(({ data }) => data === 'RETRY' && onRetryClick(), [onRetryClick]);
  const localize = useLocalizer();

  const sendFailedText = localize('ACTIVITY_STATUS_SEND_FAILED_RETRY');

  return <InlineMarkdown markdown={sendFailedText} onReference={handleReference} references={MARKDOWN_REFERENCES} />;
};

export default SendFailedRetry;
export { sendFailedRetryPropsSchema, type SendFailedRetryProps };
