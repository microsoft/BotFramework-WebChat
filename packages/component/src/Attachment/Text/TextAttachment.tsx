import React, { memo } from 'react';
import { any, custom, object, optional, pipe, readonly, safeParse, startsWith, string, type InferInput } from 'valibot';

import parseProps from '../../Utils/parseProps';
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
        contentType: custom<`text/${string}`>(value => safeParse(pipe(string(), startsWith('text/')), value).success)
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
  } = parseProps(textAttachmentPropsSchema, props);

  return <TextContent activity={activity} contentType={contentType} text={content} />;
}

export default memo(TextAttachment);
export { textAttachmentPropsSchema, type TextAttachmentProps };
