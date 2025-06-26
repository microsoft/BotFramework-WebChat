import { hooks } from 'botframework-webchat-api';
import { type WebChatActivity } from 'botframework-webchat-core';
import { validateProps } from 'botframework-webchat-react-valibot';
import React, { Fragment, memo } from 'react';
import { array, custom, object, pipe, readonly, safeParse, type InferInput } from 'valibot';

import TranscriptActivity from '../../../Transcript/TranscriptActivity';

const { useGetKeyByActivity } = hooks;

const renderActivityGroupingPropsSchema = pipe(
  object({
    activities: pipe(array(custom<WebChatActivity>(value => safeParse(object({}), value).success)), readonly())
  }),
  readonly()
);

type RenderActivityGroupingProps = InferInput<typeof renderActivityGroupingPropsSchema>;

const RenderActivityGrouping = (props: RenderActivityGroupingProps) => {
  const { activities } = validateProps(renderActivityGroupingPropsSchema, props);
  const getKeyByActivity = useGetKeyByActivity();

  return (
    <Fragment>
      {activities.map(activity => (
        <TranscriptActivity activity={activity} key={getKeyByActivity(activity)} />
      ))}
    </Fragment>
  );
};

RenderActivityGrouping.displayName = 'RenderActivityGrouping';

export default memo(RenderActivityGrouping);
export { type RenderActivityGroupingProps };
