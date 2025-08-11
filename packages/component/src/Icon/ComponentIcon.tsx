import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import cx from 'classnames';
import React, { memo } from 'react';
import { literal, object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import createIconComponent from '../Utils/createIconComponent';
import styles from './ComponentIcon.module.css';

const baseComponentIconPropsSchema = pipe(
  object({
    'aria-hidden': optional(literal('true')),
    'aria-label': optional(string()),
    className: optional(string()),
    role: optional(string())
  }),
  readonly()
);

function BaseComponentIcon(props: InferInput<typeof baseComponentIconPropsSchema>) {
  const {
    className,
    'aria-hidden': ariaHidden,
    'aria-label': ariaLabel,
    role
  } = validateProps(baseComponentIconPropsSchema, props);

  const classNames = useStyles(styles);

  return (
    <div
      aria-hidden={ariaHidden}
      aria-label={ariaLabel}
      className={cx(classNames['component-icon'], className)}
      role={role}
    />
  );
}

const { component: ComponentIcon, modifierPropsSchema: componentIconModifiersPropsSchema } = createIconComponent(
  styles,
  ['appearance', 'direction', 'icon'],
  BaseComponentIcon
);

ComponentIcon.displayName = 'ComponentIcon';

const componentIconPropsSchema = pipe(
  object({
    ...baseComponentIconPropsSchema.entries,
    ...componentIconModifiersPropsSchema.entries
  }),
  readonly()
);

type ComponentIconProps = InferInput<typeof componentIconPropsSchema>;

export default memo(ComponentIcon);
export { componentIconPropsSchema, type ComponentIconProps };
