import { parseProps } from 'botframework-webchat-component/internal';
import React, { memo } from 'react';
import { boolean, custom, object, optional, pipe, readonly, safeParse, string, type InferInput } from 'valibot';

import useStyleSet from '../../hooks/useStyleSet';
import CommonCard from './CommonCard';
import { directLineSignInCardSchema } from './private/directLineSchema';

const signInCardContentPropsSchema = pipe(
  object({
    actionPerformedClassName: optional(string(), ''), // TODO: Should remove default value.
    content: custom<InferInput<typeof directLineSignInCardSchema>>(
      value => safeParse(directLineSignInCardSchema, value).success
    ),
    disabled: optional(boolean())
  }),
  readonly()
);

type SignInCardContentProps = InferInput<typeof signInCardContentPropsSchema>;

function SignInCardContent(props: SignInCardContentProps) {
  const { actionPerformedClassName, content, disabled } = parseProps(signInCardContentPropsSchema, props);

  const [{ animationCardAttachment: animationCardAttachmentStyleSet }] = useStyleSet();

  return (
    <div className={animationCardAttachmentStyleSet}>
      <CommonCard actionPerformedClassName={actionPerformedClassName} content={content} disabled={disabled} />
    </div>
  );
}

export default memo(SignInCardContent);
export { signInCardContentPropsSchema, type SignInCardContentProps };
