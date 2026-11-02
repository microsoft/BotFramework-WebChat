import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { Component } from 'react';
import { function_, nullish, object, pipe, readonly } from 'valibot';

const errorBoundaryPropsSchema = pipe(
  object({
    children: nullish(reactNode()),
    onError: nullish(function_())
  }),
  readonly()
);

const RenderChildrenFunction = ({ children }) => (typeof children === 'function' ? children() : children);

class ErrorBoundary extends Component {
  constructor() {
    super();

    this.state = { hasError: false };
  }

  componentDidCatch(error) {
    const { onError } = validateProps(errorBoundaryPropsSchema, this.props);

    this.setState({ hasError: true });

    onError(error);
  }

  render() {
    const { children } = validateProps(errorBoundaryPropsSchema, this.props);
    const { hasError } = this.state;

    return !hasError && <RenderChildrenFunction>{children}</RenderChildrenFunction>;
  }
}

export default ErrorBoundary;
