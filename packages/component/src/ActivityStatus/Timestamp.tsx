import { hooks } from 'botframework-webchat-api';
import React, { memo } from 'react';
import { date, number, object, pipe, readonly, string, union, type InferInput } from 'valibot';

import parseProps from '../Utils/parseProps';
import AbsoluteTime from './AbsoluteTime';
import RelativeTime from './private/RelativeTime';

const { useStyleOptions } = hooks;

const timestampPropsSchema = pipe(
  object({
    timestamp: union([date(), number(), string()])
  }),
  readonly()
);

type TimestampProps = InferInput<typeof timestampPropsSchema>;

function Timestamp(props: TimestampProps) {
  const { timestamp } = parseProps(timestampPropsSchema, props);

  const [{ timestampFormat }] = useStyleOptions();

  return timestampFormat === 'relative' ? <RelativeTime value={timestamp} /> : <AbsoluteTime value={timestamp} />;
}

export default memo(Timestamp);
export { timestampPropsSchema, type TimestampProps };
