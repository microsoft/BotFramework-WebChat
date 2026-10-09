import { validateProps, type InferReactProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { memo } from 'react';
import { boolean, literal, object, optional, pipe, readonly, string } from 'valibot';

import HeroCardContent from './HeroCardContent';
import { directLineBasicCardSchema } from './private/directLineSchema';

const heroCardAttachmentPropsSchema = pipe(
  object({
    attachment: object({
      content: optional(directLineBasicCardSchema),
      contentType: literal('application/vnd.microsoft.card.hero')
    }),
    disabled: optional(boolean()),
    replyToId: optional(string())
  }),
  readonly()
);

type HeroCardAttachmentProps = InferReactProps<typeof heroCardAttachmentPropsSchema>;

const HeroCardAttachment = memo((props: HeroCardAttachmentProps) => {
  const { attachment: { content } = {}, disabled, replyToId } = validateProps(heroCardAttachmentPropsSchema, props);

  return (
    !!content && (
      <HeroCardContent
        // TODO: [P1] Validated "content" prop is marked as read-only.
        //       However, <HeroCardContent> is using InferInput<T> and accepting read-write.
        //       We should build our own InferProp<T> to work like InferInput<T> but honoring read-only.
        content={content}
        disabled={disabled}
        replyToId={replyToId}
      />
    )
  );
});

HeroCardAttachment.displayName = 'HeroCardAttachment';

export default HeroCardAttachment;
export { heroCardAttachmentPropsSchema, type HeroCardAttachmentProps };
