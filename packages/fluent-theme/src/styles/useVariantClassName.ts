import { useMemo } from 'react';
import useVariants from '../private/useVariants';
import useStyles from './useStyles';

export default function useVariantClassName<T extends CSSModuleClasses>(styles: T): string {
  const classNames = useStyles(styles);
  const variants = useVariants();
  return useMemo(
    () =>
      variants
        .map(variant => classNames[`variant-${variant}`] || variant)
        .filter(value => value)
        .join(' '),
    [classNames, variants]
  );
}
