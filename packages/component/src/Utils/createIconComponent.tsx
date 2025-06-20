import { useStyles } from 'botframework-webchat-styles/react';
import { validateProps } from 'botframework-webchat-react-valibot';
import cx from 'classnames';
import { object, optional, picklist, pipe, readonly, type OptionalSchema, type PicklistSchema } from 'valibot';
import React, { type ComponentType } from 'react';

type Prefixes<T> = T extends `${infer P}--${string}` ? P : never;

type SuffixesOf<Prefix extends string, T> = T extends `${Prefix}--${infer S}` ? S : never;

type ModifierMap<T> = {
  [P in Prefixes<keyof T>]?: SuffixesOf<P, keyof T>;
};

function createPropsSchema<
  const TCSSModfuleClasses extends CSSModuleClasses,
  const TModifiers extends Array<keyof ModifierMap<TCSSModfuleClasses>>
>(styles: TCSSModfuleClasses, modifiers: TModifiers) {
  type CSSModuleModifiers = ModifierMap<TCSSModfuleClasses>;

  const props = Object.keys(styles).reduce((acc, key) => {
    const [base, modifier] = key.split('--') as [keyof CSSModuleModifiers, string | undefined];
    if (modifier && modifiers.includes(base)) {
      acc.has(base) || acc.set(base, new Set());
      acc.get(base).add(modifier);
    }
    return acc;
  }, new Map<keyof CSSModuleModifiers, Set<string>>());

  return pipe(
    object(
      Object.fromEntries(
        Array.from(props.entries()).map(([base, modifiers]) => [base, optional(picklist(Array.from(modifiers)))])
      ) as unknown as {
        [key in TModifiers[number]]: OptionalSchema<
          PicklistSchema<Array<CSSModuleModifiers[key]>, undefined>,
          undefined
        >;
      }
    ),
    readonly()
  );
}

export default function createIconComponent<
  const TProps extends { className?: string | undefined },
  const TModifiers extends Array<keyof ModifierMap<TCSSModfuleClasses>>,
  const TCSSModfuleClasses extends CSSModuleClasses
>(styles: TCSSModfuleClasses, modifiers: TModifiers, BaseIcon: ComponentType<TProps>) {
  type CSSModuleModifiers = ModifierMap<TCSSModfuleClasses>;

  // Do not bail if no CSS modules TypeScript plugin is provided.
  type FinalCSSModuleModifiers = keyof CSSModuleModifiers extends never
    ? Record<keyof TModifiers[number], string>
    : Pick<CSSModuleModifiers, TModifiers[number]>;

  const modifierPropsSchema = createPropsSchema(styles, modifiers);

  const component = (props => {
    const { className, ...rest } = props;
    const validatedProps = validateProps(modifierPropsSchema, props);
    const classNames = useStyles(styles);

    const classes = Object.entries(validatedProps).map(([key, value]) => classNames[`${key}--${value}`]);

    return <BaseIcon className={cx(className, classes)} {...(rest as TProps)} />;
  }) as ComponentType<FinalCSSModuleModifiers & TProps>;

  return { component, modifierPropsSchema };
}
