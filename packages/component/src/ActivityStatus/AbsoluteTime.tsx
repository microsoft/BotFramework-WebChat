import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { hooks } from 'botframework-webchat-api';
import React, { Fragment } from 'react';
import { boolean, date, number, object, optional, pipe, readonly, string, union, type InferInput } from 'valibot';

import ScreenReaderText from '../ScreenReaderText';

const { useDateFormatter, useLocalizer } = hooks;

const absoluteTimePropsSchema = pipe(
  object({
    hide: optional(boolean(), false),
    value: union([date(), number(), string()])
  }),
  readonly()
);

type AbsoluteTimeProps = InferInput<typeof absoluteTimePropsSchema>;

const AbsoluteTime = (props: AbsoluteTimeProps) => {
  const { hide, value } = validateProps(absoluteTimePropsSchema, props);

  const localize = useLocalizer();
  const formatDate = useDateFormatter();

  const absoluteTime = formatDate(value);

  return (
    <Fragment>
      <ScreenReaderText text={localize('ACTIVITY_STATUS_SEND_STATUS_ALT_SENT_AT', absoluteTime)} />
      {!hide && <span aria-hidden={true}>{absoluteTime}</span>}
    </Fragment>
  );
};

export default AbsoluteTime;
export { absoluteTimePropsSchema, type AbsoluteTimeProps };
