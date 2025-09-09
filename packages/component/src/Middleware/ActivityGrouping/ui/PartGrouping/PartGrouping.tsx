import { reactNode } from '@msinternal/botframework-webchat-react-valibot';
import { getOrgSchemaMessage, type WebChatActivity } from 'botframework-webchat-core';
import React, { Fragment, memo, useMemo } from 'react';
import {
  array,
  custom,
  minLength,
  object,
  optional,
  parse,
  pipe,
  readonly,
  safeParse,
  type InferOutput
} from 'valibot';

import PartGroupingActivity from './private/PartGroupingActivity';

const partGroupingPropsSchema = pipe(
  object({
    activities: pipe(
      array(custom<Readonly<WebChatActivity>>(value => safeParse(object({}), value).success)),
      minLength(1, 'botframework-webchat: "activities" must have at least 1 activity'),
      readonly()
    ),
    children: optional(reactNode())
  }),
  readonly()
);

type PartGroupingProps = InferOutput<typeof partGroupingPropsSchema>;

function PartGrouping(props: PartGroupingProps) {
  const { activities, children } = parse(partGroupingPropsSchema, props);

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
export { partGroupingPropsSchema, type PartGroupingProps };
