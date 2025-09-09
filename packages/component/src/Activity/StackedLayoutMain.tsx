import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import cx from 'classnames';
import React, { memo } from 'react';
import { object, optional, pipe, readonly, type InferOutput } from 'valibot';

import styles from './StackedLayout.module.css';

const stackedLayoutMainPropsSchema = pipe(
  object({
    avatar: optional(reactNode()),
    children: optional(reactNode())
  }),
  readonly()
);

type StackedLayoutMainProps = InferOutput<typeof stackedLayoutMainPropsSchema>;

const StackedLayoutMain = memo((props: StackedLayoutMainProps) => {
  const { avatar, children } = validateProps(stackedLayoutMainPropsSchema, props);

  const classNames = useStyles(styles);

  return (
    <div className={classNames['stacked-layout__main']}>
      <div className={cx(classNames['stacked-layout__avatar-gutter'])}>{avatar}</div>
      <div className={cx(classNames['stacked-layout__content'])}>{children}</div>
      <div className={classNames['stacked-layout__alignment-pad']} />
    </div>
  );
});

StackedLayoutMain.displayName = 'StackedLayoutMain';

export default StackedLayoutMain;
export { stackedLayoutMainPropsSchema, type StackedLayoutMainProps };
