import { reactNode } from '@msinternal/botframework-webchat-react-valibot';
import { type WebChatActivity, getOrgSchemaMessage } from 'botframework-webchat-core';
import React, { Fragment, memo, useMemo } from 'react';
import { any, array, minLength, object, optional, parse, pipe, readonly, transform, type InferOutput } from 'valibot';

import PartGroupingActivity from './private/PartGroupingActivity';

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

type PartGroupingProps = InferOutput<typeof statusGroupingPropsSchema>;

function PartGrouping(props: PartGroupingProps) {
  const { activities, children } = parse(statusGroupingPropsSchema, props);

  // eslint-disable-next-line no-magic-numbers
  const lastActivity = activities.at(-1);

  const lastMessage = useMemo(
    () =>
      getOrgSchemaMessage(
        (
          activities
            .toReversed()
            .find(
              activity => 'streamType' in activity.channelData && activity.channelData.streamType === 'informative'
            ) || lastActivity
        )?.entities
      ),
    [activities, lastActivity]
  );

  const isGroup = activities.length > 1 || !!lastMessage?.isPartOf?.['@id'];

  return isGroup ? (
    <PartGroupingActivity activities={activities}>{children}</PartGroupingActivity>
  ) : (
    <Fragment>{children}</Fragment>
  );
}

PartGrouping.displayName = 'PartGrouping';

export default memo(PartGrouping);
export { type PartGroupingProps };
