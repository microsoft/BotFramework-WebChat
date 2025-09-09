import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import cx from 'classnames';
import React, { Fragment, memo } from 'react';
import { boolean, object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import { useVariantClassName } from '../../styles';
import SlidingDots from '../assets/SlidingDots';
import styles from './ActivityLoader.module.css';

const fluentActivityLoaderPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    className: optional(string()),
    showLoader: optional(boolean(), true)
  }),
  readonly()
);

type FluentActivityLoaderProps = InferInput<typeof fluentActivityLoaderPropsSchema>;

function FluentActivityLoader(props: FluentActivityLoaderProps) {
  const { children, className, showLoader } = validateProps(fluentActivityLoaderPropsSchema, props);

  const classNames = useStyles(styles);
  const variantClassName = useVariantClassName(classNames);

  return (
    <Fragment>
      {children}
      {showLoader && <SlidingDots className={cx(classNames['activity-loader'], variantClassName, className)} />}
    </Fragment>
  );
}

export default memo(FluentActivityLoader);
export { fluentActivityLoaderPropsSchema, type FluentActivityLoaderProps };
