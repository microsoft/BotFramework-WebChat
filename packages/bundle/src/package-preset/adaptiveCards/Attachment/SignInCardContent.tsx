import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { memo } from 'react';
import { boolean, object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import useStyleSet from '../../hooks/useStyleSet';
import CommonCard from './CommonCard';
import { directLineSignInCardSchema } from './private/directLineSchema';

const signInCardContentPropsSchema = pipe(
  object({
    actionPerformedClassName: optional(string()),
    content: directLineSignInCardSchema,
    disabled: optional(boolean())
  }),
  readonly()
);

type SignInCardContentProps = InferInput<typeof signInCardContentPropsSchema>;

function SignInCardContent(props: SignInCardContentProps) {
  const { actionPerformedClassName, content, disabled } = validateProps(signInCardContentPropsSchema, props);

  const [{ animationCardAttachment: animationCardAttachmentStyleSet }] = useStyleSet();

  return (
    <div className={animationCardAttachmentStyleSet}>
      <CommonCard actionPerformedClassName={actionPerformedClassName} content={content} disabled={disabled} />
    </div>
  );
}

export default memo(SignInCardContent);
export { signInCardContentPropsSchema, type SignInCardContentProps };
