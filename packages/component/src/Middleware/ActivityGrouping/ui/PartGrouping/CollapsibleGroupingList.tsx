import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import cx from 'classnames';
import React, { memo } from 'react';
import { any, object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import styles from './CollapsibleGrouping.module.css';

const collapsibleGroupingListPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    className: optional(string()),
    tag: optional(any())
  }),
  readonly()
);

type CollapsibleGroupingListProps = InferInput<typeof collapsibleGroupingListPropsSchema>;

const CollapsibleGroupingList = (props: CollapsibleGroupingListProps) => {
  const { className, children, tag: Tag = 'div' } = validateProps(collapsibleGroupingListPropsSchema, props);
  const classNames = useStyles(styles);

  return <Tag className={cx(classNames['collapsible-grouping__list'], className)}>{children}</Tag>;
};

CollapsibleGroupingList.displayName = 'CollapsibleGroupingList';

export default memo(CollapsibleGroupingList);
export { collapsibleGroupingListPropsSchema, type CollapsibleGroupingListProps };
