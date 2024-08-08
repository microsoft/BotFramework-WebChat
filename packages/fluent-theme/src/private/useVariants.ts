import { useContext, useMemo } from 'react';
import { VariantContext } from './VariantComposer';

export default function useVariants() {
  const { variant } = useContext(VariantContext);
  return useMemo(() => variant.split(' '), [variant]);
}
