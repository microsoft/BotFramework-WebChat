import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { hooks } from 'botframework-webchat-api';
import React, { Fragment } from 'react';
import { date, number, object, pipe, readonly, string, union, type InferInput } from 'valibot';

import ScreenReaderText from '../../ScreenReaderText';
import useForceRenderAtInterval from '../../hooks/internal/useForceRenderAtInterval';

const { useDateFormatter, useLocalizer, usePonyfill, useRelativeTimeFormatter } = hooks;

const TIMER_INTERVAL = 60000;

const relativeTimePropsSchema = pipe(
  object({
    value: union([date(), number(), string()])
  }),
  readonly()
);

type RelativeTimeProps = InferInput<typeof relativeTimePropsSchema>;

const RelativeTime = (props: RelativeTimeProps) => {
  const { value } = validateProps(relativeTimePropsSchema, props);

  const [{ Date }] = usePonyfill();
  const formatDate = useDateFormatter();
  const formatRelativeTime = useRelativeTimeFormatter();
  const localize = useLocalizer();

  const dateValue = new Date(value);

  useForceRenderAtInterval(dateValue, TIMER_INTERVAL);

  return (
    <Fragment>
      <ScreenReaderText text={localize('ACTIVITY_STATUS_SEND_STATUS_ALT_SENT_AT', formatDate(dateValue))} />
      <span aria-hidden={true}>{formatRelativeTime(dateValue)}</span>
    </Fragment>
  );
};

export default RelativeTime;
export { relativeTimePropsSchema, type RelativeTimeProps };
