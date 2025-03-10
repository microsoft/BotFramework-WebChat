import { useMemo } from 'react';

function useStyles<T extends CSSModuleClasses>(styles: T): T {
  // @ts-expect-error: entries/fromEntries don't allow to specify keys type
  return useMemo(
    () =>
      Object.freeze(
        Object.fromEntries(
          Object.entries(styles).map(([baseClassName, resultClassName]) => [
            baseClassName,
            `${baseClassName} ${resultClassName}`
          ])
        )
      ),
    [styles]
  );
}

export default useStyles;
