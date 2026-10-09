import { validateProps, type InferReactProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import React, { memo } from 'react';
import { boolean, object, optional, pipe, readonly, string } from 'valibot';

import CommonCard from './CommonCard';
import { directLineSignInCardSchema } from './private/directLineSchema';

import styles from './SignInCardContent.module.css';

const signInCardContentPropsSchema = pipe(
  object({
    actionPerformedClassName: optional(string()),
    content: directLineSignInCardSchema,
    disabled: optional(boolean()),
    replyToId: optional(string())
  }),
  readonly()
);

type SignInCardContentProps = InferReactProps<typeof signInCardContentPropsSchema>;

function SignInCardContent(props: SignInCardContentProps) {
  const { actionPerformedClassName, content, disabled, replyToId } = validateProps(signInCardContentPropsSchema, props);

  const classNames = useStyles(styles);

  return (
    <div className={classNames['sign-in-card-attachment']}>
      <CommonCard
        actionPerformedClassName={actionPerformedClassName}
        content={content}
        disabled={disabled}
        replyToId={replyToId}
      />
    </div>
  );
}

export default memo(SignInCardContent);
export { signInCardContentPropsSchema, type SignInCardContentProps };
