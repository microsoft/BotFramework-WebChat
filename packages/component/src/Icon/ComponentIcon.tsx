import { validateProps } from 'botframework-webchat-react-valibot';
import { useStyles } from 'botframework-webchat-styles/react';
import cx from 'classnames';
import React, { memo, type ComponentProps } from 'react';
import { literal, object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import createIconComponent from '../Utils/createIconComponent';
import styles from './ComponentIcon.module.css';

const componentIconPropsSchema = pipe(
  object({
    'aria-hidden': optional(literal('true')),
    'aria-label': optional(string()),
    appearance: optional(string()),
    className: optional(string()),
    direction: optional(string()),
    icon: optional(string()),
    role: optional(string()),
    size: optional(string())
  }),
  readonly()
);

type ComponentIconProps = InferInput<typeof componentIconPropsSchema>;

function BaseComponentIcon(props: ComponentIconProps) {
  const {
    className,
    'aria-hidden': ariaHidden,
    'aria-label': ariaLabel,
    role
  } = validateProps(componentIconPropsSchema, props);

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

const ComponentIcon = createIconComponent(styles, BaseComponentIcon);

type IconType = ComponentProps<typeof ComponentIcon>['icon'];

ComponentIcon.displayName = 'ComponentIcon';

export default memo(ComponentIcon);
export { componentIconPropsSchema, type ComponentIconProps, type IconType };
