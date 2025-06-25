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

type SafeModifierList<TCSSModfuleClasses> = keyof ModifierMap<TCSSModfuleClasses> extends never
  ? string
  : keyof ModifierMap<TCSSModfuleClasses>;

function createPropsSchema<
  const TCSSModfuleClasses extends CSSModuleClasses,
  const TModifiers extends SafeModifierList<TCSSModfuleClasses>
>(styles: TCSSModfuleClasses, modifiers: TModifiers[]) {
  type CSSModuleModifiers = ModifierMap<TCSSModfuleClasses>;

  const props = Object.keys(styles).reduce((acc, key) => {
    const [base, modifier] = key.split('--') as [keyof CSSModuleModifiers, string | undefined];
    if (modifier && modifiers.includes(base as unknown as TModifiers)) {
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
        [key in TModifiers]: OptionalSchema<
          PicklistSchema<Array<key extends keyof CSSModuleModifiers ? CSSModuleModifiers[key] : string>, undefined>,
          undefined
        >;
      }
    ),
    readonly()
  );
}

export default function createIconComponent<
  const TProps extends { className?: string | undefined },
  const TModifiers extends SafeModifierList<TCSSModfuleClasses>,
  const TCSSModfuleClasses extends CSSModuleClasses
>(styles: TCSSModfuleClasses, modifiers: TModifiers[], BaseIcon: ComponentType<TProps>) {
  type CSSModuleModifiers = ModifierMap<TCSSModfuleClasses>;

  // Do not bail if no CSS modules TypeScript plugin is provided.
  type FinalCSSModuleModifiers = TModifiers extends keyof CSSModuleModifiers
    ? Pick<CSSModuleModifiers, TModifiers>
    : Partial<Record<TModifiers, string>>;

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
