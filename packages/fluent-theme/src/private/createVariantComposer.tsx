import React, { Context, ReactNode, useMemo } from 'react';
import { VariantContextType, VariantList } from './VariantComposer';

const createVariantComposer =
  ({ Provider }: Context<VariantContextType>) =>
  ({ children, variant = '' }: Readonly<{ children?: ReactNode | undefined; variant?: VariantList | undefined }>) => {
    const value = useMemo(() => Object.freeze({ variant }), [variant]);

    return <Provider value={value}>{children}</Provider>;
  };

export default createVariantComposer;
