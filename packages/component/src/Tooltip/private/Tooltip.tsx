import { reactNode, validateProps, type InferReactProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles, webChatPrefixedClassName } from '@msinternal/botframework-webchat-styles/react';
import cx from 'classnames';
import React, { memo } from 'react';
import { literal, object, optional, pipe, readonly, string } from 'valibot';

import styles from './Tooltip.module.css';

const tooltipPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    className: optional(string()),
    position: optional(literal('block-start'))
  }),
  readonly()
);

type TooltipProps = InferReactProps<typeof tooltipPropsSchema>;

function Tooltip(props: TooltipProps) {
  const { children, className, position = 'block-start' } = validateProps(tooltipPropsSchema, props);

  // Keeps the "webchat__tooltip" class names.
  const classNames = useStyles(styles, webChatPrefixedClassName);

  return (
    <span
      className={cx(classNames['tooltip'], className, classNames[`tooltip--${position}`])}
      /* @ts-expect-error: inert unknown attribute */
      inert="true"
      role="tooltip"
    >
      {children}
    </span>
  );
}

export default memo(Tooltip);
export { tooltipPropsSchema, type TooltipProps };
