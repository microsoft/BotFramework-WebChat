import React, { Component, Fragment, memo, type ErrorInfo, type ReactNode } from 'react';

import { ErrorBoxPolymiddlewareProxy } from '../errorBoxPolymiddleware';

type RenderFunction<Props> = (props: Props) => { render: () => ReactNode };

type ErrorBoundaryForRenderFunctionState = {
  readonly didCatch: boolean;
  readonly error: unknown;
};

type CreateErrorBoundaryForRenderFunctionInit = {
  fallbackRenderFn?(error: unknown): { readonly render: () => ReactNode };
  onError?(error: unknown, errorInfo: ErrorInfo): void;
};

type ErrorBoundaryForRenderFunctionProps<Props> = Props & {
  readonly errorBoundaryRenderFunction: RenderFunction<Props> | undefined;
  readonly errorBoundaryWhere: string;
};

function RenderFunctionComponent<Props>({
  errorBoundaryRenderFunction,
  ...props
}: ErrorBoundaryForRenderFunctionProps<Props>) {
  return <Fragment>{errorBoundaryRenderFunction?.(props as Props)}</Fragment>;
}

class ErrorBoundaryForRenderFunction<Props> extends Component<
  ErrorBoundaryForRenderFunctionProps<Props>,
  ErrorBoundaryForRenderFunctionState
> {
  constructor(props: ErrorBoundaryForRenderFunctionProps<Props>) {
    super(props);

    this.state = Object.freeze({
      didCatch: false,
      error: undefined
    });
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryForRenderFunctionState {
    return { didCatch: true, error };
  }

  override render() {
    const { errorBoundaryWhere, ...otherProps } = this.props;
    const { didCatch, error } = this.state;

    return didCatch ? (
      <ErrorBoxPolymiddlewareProxy error={error} where={errorBoundaryWhere} />
    ) : (
      // We assume the original props must not contain "errorBoundaryRenderFunction".
      <RenderFunctionComponent<Props> {...(otherProps as any)} />
    );
  }
}

export default memo(ErrorBoundaryForRenderFunction);
export { type CreateErrorBoundaryForRenderFunctionInit, type ErrorBoundaryForRenderFunctionProps, type RenderFunction };
