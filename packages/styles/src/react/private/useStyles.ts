import { useContext, useMemo } from 'react';

import { localClassName, type ClassNameTransform } from './classNameTransforms';
import CSSModuleThemeContext from './CSSModuleThemeContext';

/**
 * Maps every local name of a CSS module to the class names its element should carry:
 *
 * 1. the readable class name from `transform` (default: the local name itself),
 * 2. the module's own hashed class name,
 * 3. the classes of the same local name from `CSSModuleThemeContext`, if any.
 */
function useStyles<T extends CSSModuleClasses>(styles: T, transform: ClassNameTransform = localClassName): T {
  const theme = useContext(CSSModuleThemeContext);

  // @ts-expect-error: entries/fromEntries don't allow to specify keys type
  return useMemo(() => {
    const themeClassNamesMap = new Map(Object.entries(theme));

    return Object.freeze(
      Object.fromEntries(
        Object.entries(styles).map(([localName, className]) => [
          localName,
          [transform(localName), className, themeClassNamesMap.get(localName)].filter(Boolean).join(' ')
        ])
      )
    );
  }, [styles, theme, transform]);
}

export default useStyles;
