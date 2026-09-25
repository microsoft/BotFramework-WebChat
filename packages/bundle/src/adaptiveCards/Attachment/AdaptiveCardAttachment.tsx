import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { memo } from 'react';
import { any, boolean, object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import AdaptiveCardContent from './AdaptiveCardContent';

const adaptiveCardAttachmentPropsSchema = pipe(
  object({
    attachment: pipe(
      object({
        content: optional(any())
      }),
      readonly()
    ),
    disabled: optional(boolean()),
    replyToId: optional(string())
  }),
  readonly()
);

type AdaptiveCardAttachmentProps = InferInput<typeof adaptiveCardAttachmentPropsSchema>;

function AdaptiveCardAttachment(props: AdaptiveCardAttachmentProps) {
  const {
    attachment: { content },
    disabled,
    replyToId
  } = validateProps(adaptiveCardAttachmentPropsSchema, props);

  return <AdaptiveCardContent content={content} disabled={disabled} replyToId={replyToId} />;
}

export default memo(AdaptiveCardAttachment);
export { adaptiveCardAttachmentPropsSchema, type AdaptiveCardAttachmentProps };
