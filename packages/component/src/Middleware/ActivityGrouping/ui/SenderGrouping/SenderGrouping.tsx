import { type WebChatActivity } from 'botframework-webchat-core';
import { reactNode } from '@msinternal/botframework-webchat-react-valibot';
import React, { memo, useMemo } from 'react';
import { any, array, minLength, object, optional, parse, pipe, readonly, transform, type InferOutput } from 'valibot';
import SenderGroupingContext, { type SenderGroupingContextType } from './private/SenderGroupingContext';

const senderGroupingPropsSchema = pipe(
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

type SenderGroupingProps = InferOutput<typeof senderGroupingPropsSchema>;

const SenderGrouping = (props: SenderGroupingProps) => {
  const { activities, children } = parse(senderGroupingPropsSchema, props);

  // "activities" props must have at least 1 activity, first/last must not be undefined.
  const firstActivity = activities[0] as WebChatActivity;
  // eslint-disable-next-line no-magic-numbers
  const lastActivity = activities.at(-1) as WebChatActivity;

  const context = useMemo<SenderGroupingContextType>(
    () =>
      Object.freeze({
        firstActivityState: Object.freeze<[WebChatActivity]>([firstActivity]),
        lastActivityState: Object.freeze<[WebChatActivity]>([lastActivity])
      }),
    [firstActivity, lastActivity]
  );

  return <SenderGroupingContext.Provider value={context}>{children}</SenderGroupingContext.Provider>;
};

SenderGrouping.displayName = 'SenderGrouping';

export default memo(SenderGrouping);
export { type SenderGroupingProps };
