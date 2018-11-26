import * as React from 'react';
import * as Sentry from '@sentry/browser';

export interface SentryBoundryProps {
  dsn: string;
  environment: string;
}

export interface SentryBoundryState {
  error: any;
}

export class SentryBoundry extends React.Component<SentryBoundryProps, SentryBoundryState> {
  constructor(props: SentryBoundryProps) {
    super(props);

    Sentry.init({
      dsn: props.dsn,
      environment: props.environment,
    });

    console.log(
      props
    );

    this.state = { error: null };
  }

  componentDidCatch(error: any, errorInfo: any) {
    this.setState({ error });
    Sentry.withScope(scope => {
      Object.keys(errorInfo).forEach(key => {
        scope.setExtra(key, errorInfo[key]);
      });
      Sentry.captureException(error);
    });
  }

  render() {
    if (this.state.error) {
      //render fallback UI
      return (
        <a onClick={() => Sentry.showReportDialog()}>Report feedback</a>
      );
    } else {
      //when there's not an error, render children untouched
      return this.props.children;
    }
  }
}