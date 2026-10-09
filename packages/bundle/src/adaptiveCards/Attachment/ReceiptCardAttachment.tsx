import { validateProps, type InferReactProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { memo } from 'react';
import { boolean, literal, object, optional, pipe, readonly, string } from 'valibot';

import ReceiptCardContent from './ReceiptCardContent';
import { directLineReceiptCardSchema } from './private/directLineSchema';

const receiptCardAttachmentPropsSchema = pipe(
  object({
    attachment: pipe(
      object({
        content: optional(directLineReceiptCardSchema),
        contentType: literal('application/vnd.microsoft.card.receipt')
      }),
      readonly()
    ),
    disabled: optional(boolean()),
    replyToId: optional(string())
  }),
  readonly()
);

type ReceiptCardAttachmentProps = InferReactProps<typeof receiptCardAttachmentPropsSchema>;

const ReceiptCardAttachment = memo((props: ReceiptCardAttachmentProps) => {
  const {
    attachment: { content },
    disabled,
    replyToId
  } = validateProps(receiptCardAttachmentPropsSchema, props);

  return !!content && <ReceiptCardContent content={content} disabled={disabled} replyToId={replyToId} />;
});

ReceiptCardAttachment.displayName = 'ReceiptCardAttachment';

export default ReceiptCardAttachment;
export { receiptCardAttachmentPropsSchema, type ReceiptCardAttachmentProps };
