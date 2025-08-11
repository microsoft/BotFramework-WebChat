/* eslint no-console: "off" */

import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { hooks } from 'botframework-webchat-api';
import React, { memo } from 'react';
import { instance, object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import useStyleSet from './hooks/useStyleSet';
import ScreenReaderText from './ScreenReaderText';

const { useLocalizer } = hooks;

const errorBoxPropsSchema = pipe(
  object({
    error: instance(Error),
    type: optional(string())
  }),
  readonly()
);

type ErrorBoxProps = InferInput<typeof errorBoxPropsSchema>;

function ErrorBox(props: ErrorBoxProps) {
  const { error, type = '' } = validateProps(errorBoxPropsSchema, props);

  const [{ errorBox: errorBoxStyleSet }] = useStyleSet();
  const localize = useLocalizer();

  return (
    <React.Fragment>
      <ScreenReaderText text={localize('ACTIVITY_ERROR_BOX_TITLE')} />
      <div className={errorBoxStyleSet}>
        <div>{type}</div>
        {/* The callstack between production and development are different, thus, we should hide it for visual regression test */}
        <details>
          <summary>{error.message}</summary>
          <pre>{error.stack}</pre>
        </details>
      </div>
    </React.Fragment>
  );
}

export default memo(ErrorBox);
export { errorBoxPropsSchema, type ErrorBoxProps };
