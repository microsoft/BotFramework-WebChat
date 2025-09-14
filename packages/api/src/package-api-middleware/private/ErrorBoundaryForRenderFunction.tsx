import React, { createContext, Fragment, memo, useContext, useMemo, type ReactElement, type ReactNode } from 'react';
import ErrorBoundary from './ErrorBoundary';

type ErrorBoundaryContextType = {
  readonly renderFunction?: ((overridingProps: any) => ReactElement | null) | undefined;
};

const ErrorBoundaryContext = createContext<ErrorBoundaryContextType>({} as any);

// Use traditional function for component name.
// eslint-disable-next-line prefer-arrow-callback
const ErrorBoundaryBody = memo(function Body<Props>(props: Partial<Props>) {
  const { renderFunction } = useContext(ErrorBoundaryContext);

  return <Fragment>{renderFunction?.(props as Props)}</Fragment>;
});

type ErrorBoundaryWrapperProps = ErrorBoundaryContextType & {
  readonly children?: ReactNode | undefined;
  readonly where: string;
};

// Use traditional function for component name.
// eslint-disable-next-line prefer-arrow-callback
const ErrorBoundaryWrapper = memo(function Wrapper({ children, renderFunction, where }: ErrorBoundaryWrapperProps) {
  const context = useMemo<ErrorBoundaryContextType>(
    () => Object.freeze({ renderFunction, where }),
    [renderFunction, where]
  );

  return (
    <ErrorBoundaryContext.Provider value={context}>
      <ErrorBoundary where={where}>{children}</ErrorBoundary>
    </ErrorBoundaryContext.Provider>
  );
});

export { ErrorBoundaryBody, ErrorBoundaryWrapper, type ErrorBoundaryWrapperProps };
