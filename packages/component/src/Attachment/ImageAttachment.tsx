import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { memo } from 'react';
import { custom, object, optional, pipe, readonly, safeParse, string, union, type InferInput } from 'valibot';

import readDataURIToBlob from '../Utils/readDataURIToBlob';
import ImageContent from './ImageContent';
import { type WebChatAttachment } from './private/types/WebChatAttachment';

const imageAttachmentPropsSchema = pipe(
  object({
    attachment: custom<WebChatAttachment>(
      value =>
        safeParse(
          union([
            object({
              contentUrl: string(),
              name: optional(string()),
              thumbnailUrl: optional(string())
            }),
            object({
              contentUrl: optional(string()),
              name: optional(string()),
              thumbnailUrl: string()
            })
          ]),
          value
        ).success
    )
  }),
  readonly()
);

type ImageAttachmentProps = InferInput<typeof imageAttachmentPropsSchema>;

// React component is better with standard function than arrow function.
// eslint-disable-next-line prefer-arrow-callback
const ImageAttachment = memo(function ImageAttachment(props: ImageAttachmentProps) {
  const { attachment } = validateProps(imageAttachmentPropsSchema, props);

  let imageURL = attachment.thumbnailUrl || attachment.contentUrl;

  // To support Content Security Policy, data URI cannot be used.
  // We need to parse the data URI into a blob: URL.
  const blob = readDataURIToBlob(imageURL);

  if (blob) {
    // Only allow image/* for image, otherwise, treat it as binary.
    // eslint-disable-next-line no-restricted-properties
    imageURL = URL.createObjectURL(
      new Blob([blob], {
        type: blob.type.startsWith('image/') ? blob.type : 'application/octet-stream'
      })
    );
  }

  return <ImageContent alt={attachment.name} src={imageURL} />;
});

export default ImageAttachment;
