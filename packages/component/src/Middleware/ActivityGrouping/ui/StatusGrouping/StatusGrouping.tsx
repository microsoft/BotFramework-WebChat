import { type WebChatActivity } from 'botframework-webchat-core';
import { reactNode } from '@msinternal/botframework-webchat-react-valibot';
import React, { memo, useMemo } from 'react';
import { any, array, minLength, object, optional, parse, pipe, readonly, transform, type InferOutput } from 'valibot';
import StatusGroupingContext, { type StatusGroupingContextType } from './private/StatusGroupingContext';

const statusGroupingPropsSchema = pipe(
  object({
    activities: pipe(
      array(
        pipe(
          any(),
          transform(value => value as WebChatActivity)
        )
      ),
      minLength(1, 'botframework-webchat: "activities" must have at least 1 activity'),
      readonly()
    ),
    children: optional(reactNode())
  }),
  readonly()
);

type StatusGroupingProps = InferOutput<typeof statusGroupingPropsSchema>;

const StatusGrouping = (props: StatusGroupingProps) => {
  const { activities, children } = parse(statusGroupingPropsSchema, props);

  // "activities" props must have at least 1 activity, first/last must not be undefined.
  const firstActivity = activities[0] as WebChatActivity;
  // eslint-disable-next-line no-magic-numbers
  const lastActivity = activities.at(-1) as WebChatActivity;

  const context = useMemo<StatusGroupingContextType>(
    () =>
      Object.freeze({
        firstActivityState: Object.freeze<[WebChatActivity]>([firstActivity]),
        lastActivityState: Object.freeze<[WebChatActivity]>([lastActivity])
      }),
    [firstActivity, lastActivity]
  );

  return <StatusGroupingContext.Provider value={context}>{children}</StatusGroupingContext.Provider>;
};

StatusGrouping.displayName = 'StatusGrouping';

export default memo(StatusGrouping);
export { type StatusGroupingProps };
