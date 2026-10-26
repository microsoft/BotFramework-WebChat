import { reactNode, validateProps, type InferReactProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import { hooks } from 'botframework-webchat-api';
import React, { memo } from 'react';
import { object, optional, pipe, readonly } from 'valibot';

import styles from './ChatHistoryBox.module.css';

const { useDirection } = hooks;

const chatHistoryToolbarPropsSchema = pipe(
  object({
    children: optional(reactNode())
  }),
  readonly()
);

type ChatHistoryToolbarProps = InferReactProps<typeof chatHistoryToolbarPropsSchema>;

function ChatHistoryToolbar(props: ChatHistoryToolbarProps) {
  const { children } = validateProps(chatHistoryToolbarPropsSchema, props);

  const [direction] = useDirection();
  const classNames = useStyles(styles);

  // The toolbar is outside of the transcript, which sets its own `dir`, so it needs `dir` for its logical position.
  return (
    <div className={classNames['chat-history-box__toolbar']} dir={direction}>
      {children}
    </div>
  );
}

export default memo(ChatHistoryToolbar);
export { chatHistoryToolbarPropsSchema, type ChatHistoryToolbarProps };
