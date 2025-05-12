import { validateProps } from 'botframework-webchat-api/internal';
import classNames from 'classnames';
import React, { memo } from 'react';
import { object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import { useStyleSet } from '../hooks';
import reactNode from '../types/internal/reactNode';

const chatHistoryBoxPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    className: optional(string())
  }),
  readonly()
);

type ChatHistoryBoxProps = InferInput<typeof chatHistoryBoxPropsSchema>;

function ChatHistoryBox(props: ChatHistoryBoxProps) {
  const { children, className } = validateProps(chatHistoryBoxPropsSchema, props);

  const [{ chatHistoryBox }] = useStyleSet();

  return <div className={classNames('webchat__chat-history-box', className, chatHistoryBox)}>{children}</div>;
}

export default memo(ChatHistoryBox);
export { chatHistoryBoxPropsSchema, type ChatHistoryBoxProps };
