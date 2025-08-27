import {
  createErrorBoxPolymiddleware,
  errorBoxComponent,
  ErrorBoxPolymiddlewareHandlerResult
} from '@msinternal/botframework-webchat-api-middleware';
import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { memo, useEffect, type ReactElement } from 'react';
import { custom, never, object, optional, pipe, readonly, unknown, type InferInput } from 'valibot';

import { useTrackException } from '../hooks';

const errorBoxTelemetryHeadlessPropsSchema = pipe(
  object({
    children: optional(never()),
    error: unknown(),
    render: optional(custom<ErrorBoxPolymiddlewareHandlerResult['render']>(value => typeof value === 'function'))
  }),
  readonly()
);

type ErrorBoxTelemetryHeadlessProps = InferInput<typeof errorBoxTelemetryHeadlessPropsSchema>;

// Use traditional function for component name.
// eslint-disable-next-line prefer-arrow-callback
const ErrorBoxTelemetryHeadless = memo(function ErrorBoxTelemetryHeadless(props: ErrorBoxTelemetryHeadlessProps) {
  const { error, render } = validateProps(errorBoxTelemetryHeadlessPropsSchema, props);
  const trackException = useTrackException();

  useEffect(() => {
    if (error instanceof Error) {
      trackException(error, false);
    } else {
      const telemetryError = new Error('Unknown error');

      telemetryError.cause = error;
      telemetryError.name = 'WebChatError';

      trackException(telemetryError, false);
    }
  }, [error, trackException]);

  // TODO: [P*] Fix this, I think it should return `ReactNode`.
  return render?.() as ReactElement;
});

const errorBoxTelemetryPolymiddleware = createErrorBoxPolymiddleware(
  next => request =>
    errorBoxComponent(ErrorBoxTelemetryHeadless, {
      error: request.error,
      render: next(request)?.render
    })
);

export default errorBoxTelemetryPolymiddleware;
