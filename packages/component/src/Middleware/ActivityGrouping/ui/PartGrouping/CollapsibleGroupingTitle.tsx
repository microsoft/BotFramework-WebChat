import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import cx from 'classnames';
import React, { memo } from 'react';
import { object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import styles from './CollapsibleGrouping.module.css';

const collapsibleGroupingTitlePropsSchema = pipe(
  object({
    children: optional(reactNode()),
    className: optional(string())
  }),
  readonly()
);

type CollapsibleGroupingTitleProps = InferInput<typeof collapsibleGroupingTitlePropsSchema>;

const CollapsibleGroupingTitle = (props: CollapsibleGroupingTitleProps) => {
  const { className, children } = validateProps(collapsibleGroupingTitlePropsSchema, props);
  const classNames = useStyles(styles);

  return <div className={cx(classNames['collapsible-grouping__title'], className)}>{children}</div>;
};

CollapsibleGroupingTitle.displayName = 'CollapsibleGroupingTitle';

export default memo(CollapsibleGroupingTitle);
export { collapsibleGroupingTitlePropsSchema, type CollapsibleGroupingTitleProps };
