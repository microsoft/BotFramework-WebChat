import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import cx from 'classnames';
import React, { memo } from 'react';
import { object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import { ComponentIcon } from '../../Icon';
import styles from './MessageStatusLoader.module.css';

const messageStatusLoaderPropsSchema = pipe(
  object({
    className: optional(string())
  }),
  readonly()
);

type MessageStatusLoaderProps = InferInput<typeof messageStatusLoaderPropsSchema>;

function MessageStatusLoader(props: MessageStatusLoaderProps) {
  const { className } = validateProps(messageStatusLoaderPropsSchema, props);
  const classNames = useStyles(styles);

  return <ComponentIcon appearance="text" className={cx(classNames['message-status-loader'], className)} />;
}

export default memo(MessageStatusLoader);
export { messageStatusLoaderPropsSchema, type MessageStatusLoaderProps };
