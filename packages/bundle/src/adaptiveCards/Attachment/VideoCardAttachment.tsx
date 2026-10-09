/* eslint react/no-array-index-key: "off" */

import { validateProps, type InferReactProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { memo } from 'react';
import { boolean, literal, object, optional, pipe, readonly, string } from 'valibot';

import VideoCardContent from './VideoCardContent';
import { directLineMediaCardSchema } from './private/directLineSchema';

const videoCardAttachmentPropsSchema = pipe(
  object({
    attachment: pipe(
      object({
        content: optional(directLineMediaCardSchema),
        contentType: literal('application/vnd.microsoft.card.video')
      }),
      readonly()
    ),
    disabled: optional(boolean()),
    replyToId: optional(string())
  }),
  readonly()
);

type VideoCardAttachmentProps = InferReactProps<typeof videoCardAttachmentPropsSchema>;

const VideoCardAttachment = memo((props: VideoCardAttachmentProps) => {
  const {
    attachment: { content },
    disabled,
    replyToId
  } = validateProps(videoCardAttachmentPropsSchema, props);

  return !!content && <VideoCardContent content={content} disabled={disabled} replyToId={replyToId} />;
});

VideoCardAttachment.displayName = 'VideoCardAttachment';

export default VideoCardAttachment;
export { videoCardAttachmentPropsSchema, type VideoCardAttachmentProps };
