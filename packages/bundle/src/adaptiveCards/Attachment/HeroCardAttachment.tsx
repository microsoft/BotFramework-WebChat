import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { memo } from 'react';
import { boolean, object, optional, pipe, readonly, type InferInput } from 'valibot';

import { HeroCardPolymiddlewareProxy } from '../../boot/actual/middleware';
import { directLineBasicCardSchema } from './private/directLineSchema';

const heroCardAttachmentPropsSchema = pipe(
  object({
    attachment: pipe(
      object({
        content: directLineBasicCardSchema
      }),
      readonly()
    ),
    disabled: optional(boolean())
  }),
  readonly()
);

type HeroCardAttachmentProps = InferInput<typeof heroCardAttachmentPropsSchema>;

function HeroCardAttachment(props: HeroCardAttachmentProps) {
  const { attachment, disabled } = validateProps(heroCardAttachmentPropsSchema, props);

  return attachment.content ? <HeroCardPolymiddlewareProxy heroCard={attachment.content} /> : null;
}

HeroCardAttachment.displayName = 'HeroCardAttachment';

export default memo(HeroCardAttachment);
