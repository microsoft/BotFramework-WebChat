import { reactNode, validateProps, type InferReactProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles, webChatPrefixedClassName } from '@msinternal/botframework-webchat-styles/react';
import cx from 'classnames';
import React, { memo } from 'react';
import { object, optional, pipe, readonly, string } from 'valibot';

import styles from './ChatHistoryBox.module.css';

const chatHistoryBoxPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    className: optional(string())
  }),
  readonly()
);

type ChatHistoryBoxProps = InferReactProps<typeof chatHistoryBoxPropsSchema>;

function ChatHistoryBox(props: ChatHistoryBoxProps) {
  const { children, className } = validateProps(chatHistoryBoxPropsSchema, props);

  // Keeps the "webchat__chat-history-box" class names.
  const classNames = useStyles(styles, webChatPrefixedClassName);

  return <div className={cx(classNames['chat-history-box'], className)}>{children}</div>;
}

export default memo(ChatHistoryBox);
export { chatHistoryBoxPropsSchema, type ChatHistoryBoxProps };
