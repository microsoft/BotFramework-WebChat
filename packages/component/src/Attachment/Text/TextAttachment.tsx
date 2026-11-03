import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { memo } from 'react';
import { any, custom, is, object, optional, pipe, readonly, startsWith, string, type InferInput } from 'valibot';

import TextContent from './TextContent';

const directLineAttachmentSchema = pipe(
  object({
    content: optional(string()),
    contentType: string(),
    contentUrl: optional(string()),
    name: optional(string()),
    thumbnailUrl: optional(string())
  }),
  readonly()
);

const textAttachmentPropsSchema = pipe(
  object({
    activity: any(),
    attachment: pipe(
      object({
        ...directLineAttachmentSchema.entries,
        contentType: custom<`text/${string}`>(value => is(pipe(string(), startsWith('text/')), value))
      }),
      readonly()
    )
  }),
  readonly()
);

type TextAttachmentProps = InferInput<typeof textAttachmentPropsSchema>;

function TextAttachment(props: TextAttachmentProps) {
  const {
    activity,
    attachment: { content, contentType }
  } = validateProps(textAttachmentPropsSchema, props);

  return <TextContent activity={activity} contentType={contentType} text={content} />;
}

export default memo(TextAttachment);
export { textAttachmentPropsSchema, type TextAttachmentProps };
