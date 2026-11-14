import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { memo, useLayoutEffect, useMemo, useState } from 'react';
import { custom, is, object, optional, pipe, readonly, string, union, type InferInput } from 'valibot';

import readDataURIToBlob from '../Utils/readDataURIToBlob';
import ImageContent from './ImageContent';
import { type WebChatAttachment } from './private/types/WebChatAttachment';

const imageAttachmentPropsSchema = pipe(
  object({
    attachment: custom<WebChatAttachment>(value =>
      is(
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
      )
    )
  }),
  readonly()
);

type ImageAttachmentProps = InferInput<typeof imageAttachmentPropsSchema>;

// React component is better with standard function than arrow function.
// eslint-disable-next-line prefer-arrow-callback
const ImageAttachment = memo(function ImageAttachment(props: ImageAttachmentProps) {
  const { attachment } = validateProps(imageAttachmentPropsSchema, props);

  const imageURL = attachment.thumbnailUrl || attachment.contentUrl;

  // To support Content Security Policy, data URI cannot be used.
  // We need to parse the data URI into a blob: URL.
  const blob = useMemo(() => readDataURIToBlob(imageURL), [imageURL]);
  const [blobURL, setBlobURL] = useState<string | undefined>();

  // Create and revoke in one effect: a hidden <Activity> and Strict Mode re-run it without rendering.
  // Layout effect: no paint without the image.
  useLayoutEffect(() => {
    if (blob) {
      // Only allow image/* for image, otherwise, treat it as binary.
      // eslint-disable-next-line no-restricted-properties
      const url = URL.createObjectURL(
        new Blob([blob], {
          type: blob.type.startsWith('image/') ? blob.type : 'application/octet-stream'
        })
      );

      setBlobURL(url);

      return () => URL.revokeObjectURL(url);
    }
  }, [blob]);

  const src = blob ? blobURL : imageURL;

  return src ? <ImageContent alt={attachment.name} src={src} /> : null;
});

export default ImageAttachment;
