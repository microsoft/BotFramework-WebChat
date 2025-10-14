import { createContext } from 'react';

import { literal, union, type InferOutput } from 'valibot';
import createComposer from './createComposer';

const variantNameSchema = union([literal(''), literal('copilot'), literal('fluent')]);

type VariantName = InferOutput<typeof variantNameSchema>;

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
export { variantNameSchema };
