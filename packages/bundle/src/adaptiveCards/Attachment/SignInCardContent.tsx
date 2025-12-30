import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import React, { memo } from 'react';
import { boolean, object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import CommonCard from './CommonCard';
import { directLineSignInCardSchema } from './private/directLineSchema';

import styles from './SignInCardContent.module.css';

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

  const classNames = useStyles(styles);

  return (
    <div className={classNames['sign-in-card-attachment']}>
      <CommonCard actionPerformedClassName={actionPerformedClassName} content={content} disabled={disabled} />
    </div>
  );
}

export default memo(SignInCardContent);
export { signInCardContentPropsSchema, type SignInCardContentProps };
