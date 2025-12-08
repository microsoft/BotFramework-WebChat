import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import { createIconComponent } from 'botframework-webchat/internal';
import cx from 'classnames';
import React, { memo, useMemo, type CSSProperties } from 'react';
import { object, optional, pipe, readonly, string, union, type InferOutput } from 'valibot';

import styles from './FluentIcon.module.css';

const baseFluentIconPropsSchema = pipe(
  object({
    className: optional(string()),
    mask: optional(string())
  }),
  readonly()
);

function BaseFluentIcon(props: InferOutput<typeof baseFluentIconPropsSchema>) {
  const { className } = validateProps(baseFluentIconPropsSchema, props);

  const classNames = useStyles(styles);

  const maskStyle = useMemo(
    () =>
      props.mask ? ({ '--webchat__fluent-icon--mask': `url(${JSON.stringify(props.mask)})` } as CSSProperties) : {},
    [props.mask]
  );

  return <div className={cx(classNames['fluent-icon'], className)} style={maskStyle} />;
}

const { component: FluentIcon, modifierPropsSchema } = createIconComponent(
  styles,
  ['appearance', 'icon'],
  BaseFluentIcon
);

FluentIcon.displayName = 'FluentIcon';

const fluentIconPropsSchema = pipe(union([baseFluentIconPropsSchema, modifierPropsSchema]), readonly());

type FluentIconProps = InferOutput<typeof fluentIconPropsSchema>;

export default memo(FluentIcon);
export { fluentIconPropsSchema, type FluentIconProps };
