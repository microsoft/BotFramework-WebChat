/* eslint no-console: "off" */

import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { hooks } from 'botframework-webchat-api';
import React, { memo, useEffect } from 'react';
import { object, optional, pipe, readonly, string, unknown, type InferInput } from 'valibot';

import useStyleSet from './hooks/useStyleSet';
import ScreenReaderText from './ScreenReaderText';

const { useLocalizer, useTrackException } = hooks;

const errorBoxPropsSchema = pipe(
  object({
    error: unknown(),
    type: optional(string())
  }),
  readonly()
);

type ErrorBoxProps = InferInput<typeof errorBoxPropsSchema>;

function ErrorBox(props: ErrorBoxProps) {
  const { error, type = '' } = validateProps(errorBoxPropsSchema, props);

  const [{ errorBox: errorBoxStyleSet }] = useStyleSet();
  const localize = useLocalizer();
  const trackException = useTrackException();

  useEffect(() => {
    let rectifiedError: Error;

    if (error instanceof Error) {
      rectifiedError = error;
    } else {
      rectifiedError = new Error('Unknown error occured');
      rectifiedError.cause = error;
    }

    trackException(rectifiedError, false);
  }, [error, trackException]);

  useEffect(() => {
    console.group(`botframework-webchat: ${type}`);
    console.error(error);
    console.groupEnd();
  }, [error, type]);

  return (
    <React.Fragment>
      <ScreenReaderText text={localize('ACTIVITY_ERROR_BOX_TITLE')} />
      <div className={errorBoxStyleSet}>
        <div>{type}</div>
        {/* The callstack between production and development are different, thus, we should hide it for visual regression test */}
        {error instanceof Error ? (
          <details>
            <summary>{error.message}</summary>
            <pre>{error.stack}</pre>
          </details>
        ) : (
          // eslint-disable-next-line no-magic-numbers
          <pre>{JSON.stringify(error, null, 2)}</pre>
        )}
      </div>
    </React.Fragment>
  );
}

export default memo(ErrorBox);
export { errorBoxPropsSchema, type ErrorBoxProps };
