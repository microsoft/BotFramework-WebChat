import { createIconComponent } from 'botframework-webchat-component/internal';
import { validateProps } from 'botframework-webchat-react-valibot';
import { useStyles } from 'botframework-webchat-styles/react';
import cx from 'classnames';
import React, { memo, useMemo, type CSSProperties } from 'react';
import { object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import styles from './FluentIcon.module.css';

const FluentIconPropsSchema = pipe(
  object({
    appearance: optional(string()),
    className: optional(string()),
    icon: optional(string()),
    mask: optional(string()),
    size: optional(string())
  }),
  readonly()
);

type FluentIconProps = InferInput<typeof FluentIconPropsSchema>;

function BaseFluentIcon(props: FluentIconProps) {
  const { className } = validateProps(FluentIconPropsSchema, props);

  const classNames = useStyles(styles);

  const maskStyle = useMemo(
    () =>
      props.mask ? ({ '--webchat__fluent-icon--mask': `url(${JSON.stringify(props.mask)})` } as CSSProperties) : {},
    [props.mask]
  );

  return <div className={cx(classNames['fluent-icon'], className)} style={maskStyle} />;
}

const FluentIcon = createIconComponent(styles, BaseFluentIcon);

FluentIcon.displayName = 'FluentIcon';

export default memo(FluentIcon);
export { FluentIconPropsSchema, type FluentIconProps };
