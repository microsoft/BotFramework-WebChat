import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { type WebChatActivity } from 'botframework-webchat/internal';
import cx from 'classnames';
import React, { ReactNode, memo } from 'react';
import { object, optional, pipe, readonly, type InferInput } from 'valibot';

import { useStyles, useVariantClassName } from '../../styles';
import styles from './ActivityDecorator.module.css';

const activityDecoratorPropsSchema = pipe(
  object({
    children: optional(reactNode())
  }),
  readonly()
);

type ActivityDecoratorProps = InferInput<typeof activityDecoratorPropsSchema>;

function ActivityDecorator(props: Readonly<{ activity: WebChatActivity; children: ReactNode }>) {
  const { children } = validateProps(activityDecoratorPropsSchema, props);

  const classNames = useStyles(styles);
  const variantClassName = useVariantClassName(styles);

  return <div className={cx(classNames['activity-decorator'], variantClassName)}>{children}</div>;
}

ActivityDecorator.displayName = 'ActivityDecorator';

export default memo(ActivityDecorator);
export { activityDecoratorPropsSchema, type ActivityDecoratorProps };
