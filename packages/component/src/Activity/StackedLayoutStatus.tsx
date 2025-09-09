import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import cx from 'classnames';
import React, { memo } from 'react';
import { object, optional, pipe, readonly, type InferInput } from 'valibot';

import styles from './StackedLayout.module.css';

const stackedLayoutStatusPropsSchema = pipe(
  object({
    children: optional(reactNode())
  }),
  readonly()
);

type StackedLayoutStatusProps = InferInput<typeof stackedLayoutStatusPropsSchema>;

const StackedLayoutStatus = memo((props: StackedLayoutStatusProps) => {
  const { children } = validateProps(stackedLayoutStatusPropsSchema, props);

  const classNames = useStyles(styles);

  return (
    <div className={cx(classNames['stacked-layout__status'])}>
      <div className={cx(classNames['stacked-layout__avatar-gutter'])} />
      <div className={cx(classNames['stacked-layout__nub-pad'])} />
      {children}
      <div className={cx(classNames['stacked-layout__alignment-pad'])} />
    </div>
  );
});

StackedLayoutStatus.displayName = 'StackedLayoutStatus';

export default StackedLayoutStatus;
export { stackedLayoutStatusPropsSchema, type StackedLayoutStatusProps };
