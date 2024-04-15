import { useMemo } from 'react';

/**
 * This type indicates that the class doesn't start with
 * the `webchat-fluent__` prefix, so it cant be used
 */
type InvalidClassName = {
  __invalidClassName: never;
};

type PrefixedClassNames<T extends CSSModuleClasses> = {
  [Key in keyof T]: Key extends `webchat-fluent__${string}` ? T[Key] : InvalidClassName;
};

function useStyles<T extends CSSModuleClasses>(styles: T): PrefixedClassNames<T> {
  // @ts-expect-error: entries/fromEntries don't allow to specify keys type
  return useMemo(
    () =>
      Object.freeze(
        Object.fromEntries(Object.entries(styles).map(([baseCls, resultCls]) => [baseCls, `${baseCls} ${resultCls}`]))
      ),
    [styles]
  );
}

export default useStyles;
