import { useStyles } from 'botframework-webchat-styles/react';
import { validateProps } from 'botframework-webchat-react-valibot';
import cx from 'classnames';
import { object, optional, pipe, readonly, picklist } from 'valibot';
import React, { type ComponentType } from 'react';

type CSSModule = {
  readonly [key: string | `${string}--${string}`]: any;
};

function createPropsSchema(styles: CSSModule) {
  const props = Object.keys(styles).reduce((acc, key) => {
    const [base, modifier] = key.split('--');
    if (modifier) {
      acc.has(base) || acc.set(base, new Set());
      acc.get(base).add(modifier);
    }
    return acc;
  }, new Map<string, Set<string>>());
  return pipe(
    object(
      Object.fromEntries(
        Array.from(props.entries()).map(([base, modifiers]) => [base, optional(picklist(Array.from(modifiers)))])
      )
    ),
    readonly()
  );
}

export default function createIconComponent<T extends { className?: string | undefined }>(
  styles: CSSModule,
  BaseIcon: ComponentType<T>
) {
  const propsSchema = createPropsSchema(styles);
  return (props => {
    const { className, ...rest } = props;
    const validatedProps = validateProps(propsSchema, props);
    const classNames = useStyles(styles);

    const classes = Object.entries(validatedProps).map(([key, value]) => classNames[`${key}--${value}`]);

    return <BaseIcon className={cx(className, classes)} {...(rest as T)} />;
  }) as typeof BaseIcon & { displayName?: string | undefined };
}
