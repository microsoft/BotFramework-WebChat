/* eslint react/no-array-index-key: "off" */

import { validateProps, type InferReactProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { memo } from 'react';
import { boolean, literal, object, optional, pipe, readonly, string } from 'valibot';

import AudioCardContent from './AudioCardContent';
import { directLineMediaCardSchema } from './private/directLineSchema';

const audioCardAttachmentPropsSchema = pipe(
  object({
    attachment: pipe(
      object({
        content: optional(directLineMediaCardSchema),
        contentType: literal('application/vnd.microsoft.card.audio')
      }),
      readonly()
    ),
    disabled: optional(boolean()),
    replyToId: optional(string())
  }),
  readonly()
);

type AudioCardAttachmentProps = InferReactProps<typeof audioCardAttachmentPropsSchema>;

const AudioCardAttachment = memo((props: AudioCardAttachmentProps) => {
  const {
    attachment: { content },
    disabled,
    replyToId
  } = validateProps(audioCardAttachmentPropsSchema, props);

  return !!content && <AudioCardContent content={content} disabled={disabled} replyToId={replyToId} />;
});

AudioCardAttachment.displayName = 'AudioCardAttachment';

export default AudioCardAttachment;
export { audioCardAttachmentPropsSchema, type AudioCardAttachmentProps };
