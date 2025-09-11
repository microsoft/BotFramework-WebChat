import React, { Component, memo, type ReactNode } from 'react';

import { ErrorBoxPolymiddlewareProxy } from '../errorBoxPolymiddleware';

type ErrorBoundaryProps = {
  readonly children?: ReactNode | undefined;
  readonly where: string;
};

type ErrorBoundaryState = {
  readonly didCatch: boolean;
  readonly error: unknown;
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = Object.freeze({
      didCatch: false,
      error: undefined
    });
  }

  // eslint-disable-next-line class-methods-use-this
  override componentDidCatch(): void {
    // Intentionally left blank.
    // If this function is not overridden, React will not console.error() the error.
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { didCatch: true, error };
  }

  override render() {
    const { children, where } = this.props;
    const { didCatch, error } = this.state;

    return didCatch ? <ErrorBoxPolymiddlewareProxy error={error} where={where} /> : children;
  }
}

export default memo(ErrorBoundary);
