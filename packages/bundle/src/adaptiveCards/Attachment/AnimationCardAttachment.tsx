import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { memo } from 'react';
import { boolean, literal, object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import AnimationCardContent from './AnimationCardContent';
import { directLineMediaCardSchema } from './private/directLineSchema';

const animationCardAttachmentPropsSchema = pipe(
  object({
    attachment: pipe(
      object({
        content: optional(directLineMediaCardSchema),
        contentType: literal('application/vnd.microsoft.card.animation')
      }),
      readonly()
    ),
    disabled: optional(boolean()),
    replyToId: optional(string())
  }),
  readonly()
);

type AnimationCardAttachmentProps = InferInput<typeof animationCardAttachmentPropsSchema>;

const AnimationCardAttachment = memo((props: AnimationCardAttachmentProps) => {
  const {
    attachment: { content },
    disabled,
    replyToId
  } = validateProps(animationCardAttachmentPropsSchema, props);

  return !!content && <AnimationCardContent content={content} disabled={disabled} replyToId={replyToId} />;
});

AnimationCardAttachment.displayName = 'AnimationCardAttachment';

export default AnimationCardAttachment;
export { animationCardAttachmentPropsSchema, type AnimationCardAttachmentProps };
