import React, { memo, useEffect, useMemo, useState, type ReactNode } from 'react';

import { type ContextOf } from '../../types/ContextOf';
import Context from './private/Context';

type ContextType = ContextOf<typeof Context>;

type ReducedMotionComposerProps = Readonly<{
  children?: ReactNode | undefined;
}>;

const ReducedMotionComposer = memo(({ children }: ReducedMotionComposerProps) => {
  const shouldReduceMotionQueryList = useMemo(() => matchMedia?.('(prefers-reduced-motion: reduce)'), []);
  const [shouldReduceMotion, setShouldReduceMotion] = useState<boolean>(
    () => shouldReduceMotionQueryList?.matches ?? false
  );

  const shouldReduceMotionState = useMemo(() => Object.freeze([shouldReduceMotion] as const), [shouldReduceMotion]);

  const context = useMemo<ContextType>(() => Object.freeze({ shouldReduceMotionState }), [shouldReduceMotionState]);

  useEffect(() => {
    const handleChange = ({ matches }: MediaQueryListEvent) => setShouldReduceMotion(matches);

    shouldReduceMotionQueryList.addEventListener('change', handleChange);

    return () => shouldReduceMotionQueryList.removeEventListener('change', handleChange);
  }, [setShouldReduceMotion, shouldReduceMotionQueryList]);

  return <Context.Provider value={context}>{children}</Context.Provider>;
});

ReducedMotionComposer.displayName = 'ReducedMotionComposer';

export default ReducedMotionComposer;
