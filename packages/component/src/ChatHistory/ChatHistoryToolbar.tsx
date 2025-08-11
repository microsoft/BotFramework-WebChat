import { hooks } from 'botframework-webchat-api';
import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import classNames from 'classnames';
import React, { memo } from 'react';
import { object, optional, pipe, readonly, type InferInput } from 'valibot';

const { useDirection } = hooks;

const chatHistoryToolbarPropsSchema = pipe(
  object({
    children: optional(reactNode())
  }),
  readonly()
);

type ChatHistoryToolbarProps = InferInput<typeof chatHistoryToolbarPropsSchema>;

function ChatHistoryToolbar(props: ChatHistoryToolbarProps) {
  const { children } = validateProps(chatHistoryToolbarPropsSchema, props);

  const [direction] = useDirection();

  return (
    <div
      className={classNames(
        'webchat__chat-history-box__toolbar',
        direction === 'rtl' ? 'webchat__chat-history-box__toolbar--rtl' : ''
      )}
    >
      {children}
    </div>
  );
}

export default memo(ChatHistoryToolbar);
export { chatHistoryToolbarPropsSchema, type ChatHistoryToolbarProps };
