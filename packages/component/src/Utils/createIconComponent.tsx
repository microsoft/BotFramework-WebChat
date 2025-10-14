import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import cx from 'classnames';
import {
  object,
  optional,
  picklist,
  pipe,
  readonly,
  type BaseIssue,
  type BaseSchema,
  type OptionalSchema,
  type PicklistSchema
} from 'valibot';
import React, { type ComponentType } from 'react';

type CSSModuleClasses = { readonly [key: string]: any };

type Prefixes<T> = T extends `${infer P}--${string}` ? P : never;

type SuffixesOf<Prefix extends string, T> = T extends `${Prefix}--${infer S}` ? S : never;

type ModifierMap<T> = {
  [P in Prefixes<keyof T>]?: SuffixesOf<P, keyof T>;
};

type SafeModifierList<TCSSModuleClasses> = keyof ModifierMap<TCSSModuleClasses> extends never
  ? string
  : keyof ModifierMap<TCSSModuleClasses>;

type ModifierSchemaEntry = OptionalSchema<PicklistSchema<readonly [string, ...string[]], undefined>, undefined>;

export type IconModifierPropsSchema<TModifiers extends string> = BaseSchema<
  Partial<Record<TModifiers, string>>,
  Readonly<Partial<Record<TModifiers, string>>>,
  BaseIssue<unknown>
> & {
  readonly entries: Partial<Record<TModifiers, ModifierSchemaEntry>>;
};

function createPropsSchema<
  const TCSSModuleClasses extends CSSModuleClasses,
  const TModifiers extends SafeModifierList<TCSSModuleClasses>
>(styles: TCSSModuleClasses, modifiers: TModifiers[]): IconModifierPropsSchema<TModifiers> {
  const props = Object.keys(styles).reduce((acc, key) => {
    const [rawBase, modifier] = key.split('--') as [string, string | undefined];

    if (!modifier) {
      return acc;
    }

    const base = rawBase as TModifiers;

    if (!modifiers.includes(base)) {
      return acc;
    }

    let modifierSet = acc.get(base);

    if (!modifierSet) {
      modifierSet = new Set<string>();
      acc.set(base, modifierSet);
    }

    modifierSet.add(modifier);

    return acc;
  }, new Map<TModifiers, Set<string>>());

  const schemaEntries = Array.from(props.entries()).reduce<Partial<Record<TModifiers, ModifierSchemaEntry>>>(
    (acc, [base, modifierSet]) => {
      const values = Array.from(modifierSet);

      if (values.length) {
        // eslint-disable-next-line security/detect-object-injection
        acc[base] = optional(picklist(values as unknown as readonly [string, ...string[]])) as ModifierSchemaEntry;
      }

      return acc;
    },
    {}
  );

  const schema = object(schemaEntries as Partial<Record<TModifiers, ModifierSchemaEntry>>);

  return pipe(schema, readonly()) as IconModifierPropsSchema<TModifiers>;
}

export default function createIconComponent<
  const TProps extends { className?: string | undefined },
  const TModifiers extends SafeModifierList<TCSSModuleClasses>,
  const TCSSModuleClasses extends CSSModuleClasses
>(
  styles: TCSSModuleClasses,
  modifiers: TModifiers[],
  BaseIcon: ComponentType<TProps>
): {
  component: ComponentType<
    (TModifiers extends Prefixes<keyof TCSSModuleClasses>
      ? Pick<ModifierMap<TCSSModuleClasses>, TModifiers>
      : Partial<Record<TModifiers, string>>) &
      TProps
  >;
  modifierPropsSchema: IconModifierPropsSchema<TModifiers>;
} {
  type CSSModuleModifiers = ModifierMap<TCSSModuleClasses>;

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
