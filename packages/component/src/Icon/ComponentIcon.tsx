import { validateProps } from 'botframework-webchat-react-valibot';
import { useStyles } from 'botframework-webchat-styles/react';
import cx from 'classnames';
import React, { memo } from 'react';
import { object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import createIconComponent from '../Utils/createIconComponent';
import styles from './ComponentIcon.module.css';

const componentIconPropsSchema = pipe(
  object({
    appearance: optional(string()),
    className: optional(string()),
    icon: optional(string()),
    size: optional(string())
  }),
  readonly()
);

type ComponentIconProps = InferInput<typeof componentIconPropsSchema>;

function BaseComponentIcon(props: ComponentIconProps) {
  const { className } = validateProps(componentIconPropsSchema, props);

  const classNames = useStyles(styles);

  return <div className={cx(classNames['component-icon'], className)} />;
}

const ComponentIcon = createIconComponent(styles, BaseComponentIcon);

ComponentIcon.displayName = 'ComponentIcon';

export default memo(ComponentIcon);
export { componentIconPropsSchema, type ComponentIconProps };  
