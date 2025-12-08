import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import cx from 'classnames';
import React, { memo } from 'react';
import { object, optional, pipe, readonly, type InferOutput } from 'valibot';
import { useStyles, useVariantClassName } from '../../styles';
import styles from './Theme.module.css';

export const rootClassName = 'webchat-fluent';

const themePropsSchema = pipe(
  object({
    children: optional(reactNode())
  }),
  readonly()
);

type ThemeProps = InferOutput<typeof themePropsSchema>;

function Theme(props: ThemeProps) {
  const { children } = validateProps(themePropsSchema, props);

  const classNames = useStyles(styles);
  const variantClassName = useVariantClassName(styles);

  return <div className={cx(rootClassName, classNames['theme'], variantClassName)}>{children}</div>;
}

export default memo(Theme);
export { themePropsSchema, type ThemeProps };
