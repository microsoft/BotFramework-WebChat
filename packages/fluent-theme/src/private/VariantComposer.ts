import { createContext } from 'react';

import { custom, type InferOutput } from 'valibot';
import createComposer from './createComposer';

const supportedVariants = ['', 'copilot', 'fluent'] as const;

const variantNameSchema = custom<'' | 'fluent' | 'copilot' | `${string} ${string}`>(
  value =>
    typeof value === 'string' &&
    (supportedVariants.includes(value as (typeof supportedVariants)[number]) || /\s+/u.test(value as string))
);

export type VariantList = InferOutput<typeof variantNameSchema>;

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
export { variantNameSchema };
