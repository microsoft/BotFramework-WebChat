import { createContext } from 'react';

import createComposer from './createComposer';

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

const VariantComposer = createComposer<VariantContextType>(VariantContext, {
  defaults: { variant: '' },
  displayName: 'VariantComposer'
});

export default VariantComposer;
