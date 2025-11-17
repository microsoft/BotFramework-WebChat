import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import cx from 'classnames';
import React, { memo } from 'react';
import { object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import { ComponentIcon } from '../Icon';
import MessageStatusLoader from './private/MessageStatusLoader';

import styles from './StackedLayout.module.css';

const stackedLayoutMessageStatusPropsSchema = pipe(
  object({
    className: optional(string()),
    creativeWorkStatus: optional(string())
  }),
  readonly()
);

type StackedLayoutMessageStatusProps = InferInput<typeof stackedLayoutMessageStatusPropsSchema>;

const StackedLayoutMessageStatus = (props: StackedLayoutMessageStatusProps) => {
  const { className, creativeWorkStatus } = validateProps(stackedLayoutMessageStatusPropsSchema, props);

  const classNames = useStyles(styles);

  return (
    <div
      className={cx(
        classNames['stacked-layout__message-status'],
        {
          [classNames['stacked-layout__message-status--unset']]: !creativeWorkStatus,
          [classNames['stacked-layout__message-status--final']]: creativeWorkStatus === 'Published',
          [classNames['stacked-layout__message-status--incomplete']]: creativeWorkStatus === 'Incomplete'
        },
        className
      )}
    >
      <ComponentIcon
        appearance="text"
        className={classNames['stacked-layout__message-status-unset-icon']}
        icon="unchecked-circle"
      />
      <ComponentIcon
        appearance="text"
        className={classNames['stacked-layout__message-status-complete-icon']}
        icon="checkmark-circle"
      />
      <MessageStatusLoader className={classNames['stacked-layout__message-status-loader']} />
    </div>
  );
};

StackedLayoutMessageStatus.displayName = 'StackedLayoutMessageStatus';

export default memo(StackedLayoutMessageStatus);
export { stackedLayoutMessageStatusPropsSchema, type StackedLayoutMessageStatusProps };
