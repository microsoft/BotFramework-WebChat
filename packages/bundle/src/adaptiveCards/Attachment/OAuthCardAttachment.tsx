import React, { memo } from 'react';

import { validateProps, type InferReactProps } from '@msinternal/botframework-webchat-react-valibot';
import { boolean, literal, object, optional, pipe, readonly, string } from 'valibot';
import OAuthCardContent from './OAuthCardContent';
import { directLineSignInCardSchema } from './private/directLineSchema';

const oauthCardAttachmentPropsSchema = pipe(
  object({
    attachment: pipe(
      object({
        content: optional(directLineSignInCardSchema),
        contentType: literal('application/vnd.microsoft.card.oauth')
      }),
      readonly()
    ),
    disabled: optional(boolean()),
    replyToId: optional(string())
  }),
  readonly()
);

type OAuthCardAttachmentProps = InferReactProps<typeof oauthCardAttachmentPropsSchema>;

const OAuthCardAttachment = memo((props: OAuthCardAttachmentProps) => {
  const { attachment: { content } = {}, disabled, replyToId } = validateProps(oauthCardAttachmentPropsSchema, props);

  return !!content&&<OAuthCardContent content={content} disabled={disabled} replyToId={replyToId} />;
});

OAuthCardAttachment.displayName = 'OAuthCardAttachment';

export default OAuthCardAttachment;
export { oauthCardAttachmentPropsSchema, type OAuthCardAttachmentProps };
