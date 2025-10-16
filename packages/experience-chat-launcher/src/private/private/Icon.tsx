/* TODO: [P0] Dupe from packages/fluent-theme/src/components/icon/FluentIcon.tsx, should dedupe. */
import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import { createIconComponent } from 'botframework-webchat/internal';
import cx from 'classnames';
import React, { memo, useMemo, type CSSProperties } from 'react';
import { object, optional, pipe, readonly, string, union, type InferInput } from 'valibot';

import styles from './Icon.module.css';

const baseIconPropsSchema = pipe(
  object({
    className: optional(string()),
    mask: optional(string())
  }),
  readonly()
);

function BaseIcon(props: InferInput<typeof baseIconPropsSchema>) {
  const { className, mask } = validateProps(baseIconPropsSchema, props);

  const classNames = useStyles(styles);

  const maskStyle = useMemo(
    () => (mask ? ({ '--webchat__icon--mask': `url(${JSON.stringify(mask)})` } as CSSProperties) : {}),
    [mask]
  );

  return <div className={cx(classNames['icon'], className)} style={maskStyle} />;
}

const { component: Icon, modifierPropsSchema } = createIconComponent(styles, ['appearance', 'icon'], BaseIcon);

Icon.displayName = 'Icon';

const iconPropsSchema = pipe(union([baseIconPropsSchema, modifierPropsSchema]), readonly());

type IconProps = InferInput<typeof iconPropsSchema>;

export default memo(Icon);
export { iconPropsSchema, type IconProps };
