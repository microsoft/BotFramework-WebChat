import { validateProps, type InferReactProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { memo } from 'react';
import { boolean, literal, object, optional, pipe, readonly, string } from 'valibot';

import { directLineSignInCardSchema } from './private/directLineSchema';
import SignInCardContent from './SignInCardContent';

const signInCardAttachmentPropsSchema = pipe(
  object({
    attachment: pipe(
      object({
        content: optional(directLineSignInCardSchema),
        contentType: literal('application/vnd.microsoft.card.signin')
      }),
      readonly()
    ),
    disabled: optional(boolean()),
    replyToId: optional(string())
  }),
  readonly()
);

type SignInCardAttachmentProps = InferReactProps<typeof signInCardAttachmentPropsSchema>;

const SignInCardAttachment = memo((props: SignInCardAttachmentProps) => {
  const {
    attachment: { content },
    disabled,
    replyToId
  } = validateProps(signInCardAttachmentPropsSchema, props);

  return !!content && <SignInCardContent content={content} disabled={disabled} replyToId={replyToId} />;
});

SignInCardAttachment.displayName = 'SignInCardAttachment';

export default SignInCardAttachment;
export { signInCardAttachmentPropsSchema, type SignInCardAttachmentProps };
