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

// ReceiptCardAttachment.defaultProps = {
//   disabled: undefined
// };

// ReceiptCardAttachment.propTypes = {
//   attachment: PropTypes.shape({
//     content: PropTypes.shape({
//       buttons: PropTypes.array,
//       facts: PropTypes.arrayOf(
//         PropTypes.shape({
//           key: PropTypes.string,
//           value: PropTypes.string
//         })
//       ),
//       items: PropTypes.arrayOf(
//         PropTypes.shape({
//           image: PropTypes.shape({
//             alt: PropTypes.string.isRequired,
//             tap: PropTypes.any,
//             url: PropTypes.string.isRequired
//           }),
//           price: PropTypes.string.isRequired,
//           quantity: PropTypes.string,
//           subtitle: PropTypes.string,
//           tap: PropTypes.any,
//           text: PropTypes.string,
//           title: PropTypes.string.isRequired
//         })
//       ),
//       tap: PropTypes.any,
//       tax: PropTypes.string,
//       title: PropTypes.string,
//       total: PropTypes.string,
//       vat: PropTypes.string
//     }).isRequired
//   }).isRequired,
//   disabled: PropTypes.bool
// };

export default ReceiptCardAttachment;
export { receiptCardAttachmentPropsSchema, type ReceiptCardAttachmentProps };
