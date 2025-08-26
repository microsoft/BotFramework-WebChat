import { createErrorBoxPolymiddleware, errorBoxComponent } from '@msinternal/botframework-webchat-api-middleware';
import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { memo, useEffect } from 'react';
import { never, object, optional, pipe, readonly, unknown, type InferInput } from 'valibot';

import { useTrackException } from '../hooks';

const errorBoxTelemetryHeadlessPropsSchema = pipe(
  object({
    children: optional(never()),
    error: unknown()
  }),
  readonly()
);

type ErrorBoxTelemetryHeadlessProps = InferInput<typeof errorBoxTelemetryHeadlessPropsSchema>;

// Use traditional function for component name.
// eslint-disable-next-line prefer-arrow-callback
const ErrorBoxTelemetryHeadless = memo(function ErrorBoxTelemetryHeadless(props: ErrorBoxTelemetryHeadlessProps) {
  const { error } = validateProps(errorBoxTelemetryHeadlessPropsSchema, props);
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

  return null;
});

const errorBoxTelemetryPolymiddleware = createErrorBoxPolymiddleware(
  () => request =>
    errorBoxComponent(ErrorBoxTelemetryHeadless, {
      error: request.error
    })
);

export default errorBoxTelemetryPolymiddleware;
