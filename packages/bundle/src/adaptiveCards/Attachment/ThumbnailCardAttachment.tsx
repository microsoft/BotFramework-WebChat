import React, { memo } from 'react';
import { boolean, literal, object, optional, pipe, readonly, string } from 'valibot';

import { validateProps, type InferReactProps } from '@msinternal/botframework-webchat-react-valibot';
import ThumbnailCardContent from './ThumbnailCardContent';
import { directLineBasicCardSchema } from './private/directLineSchema';

const thumbnailCardAttachmentPropsSchema = pipe(
  object({
    attachment: pipe(
      object({
        content: optional(directLineBasicCardSchema),
        contentType: literal('application/vnd.microsoft.card.thumbnail')
      }),
      readonly()
    ),
    disabled: optional(boolean()),
    replyToId: optional(string())
  }),
  readonly()
);

type ThumbnailCardAttachmentProps = InferReactProps<typeof thumbnailCardAttachmentPropsSchema>;

const ThumbnailCardAttachment = memo((props: ThumbnailCardAttachmentProps) => {
  const {
    attachment: { content },
    disabled,
    replyToId
  } = validateProps(thumbnailCardAttachmentPropsSchema, props);

  return !!content && <ThumbnailCardContent content={content} disabled={disabled} replyToId={replyToId} />;
});

ThumbnailCardAttachment.displayName = 'ThumbnailCardAttachment';

export default ThumbnailCardAttachment;
export { thumbnailCardAttachmentPropsSchema, type ThumbnailCardAttachmentProps };
