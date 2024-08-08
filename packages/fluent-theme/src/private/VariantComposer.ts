import { createContext, memo } from 'react';
import createVariantComposer from './createVariantComposer';

type VariantName = 'fluent' | 'copilot' | '';

export type VariantList = `${VariantName}`;

export type VariantContextType = {
  variant: VariantList;
};

export const VariantContext = createContext<VariantContextType>(
  new Proxy(
    {},
    {
      get() {
        throw new Error('Unable to use VariantContext without VariantComposer');
      }
    }
  ) as unknown as VariantContextType
);

const VariantComposer = memo(createVariantComposer(VariantContext));

VariantComposer.displayName = 'VariantComposer';

export default VariantComposer;
