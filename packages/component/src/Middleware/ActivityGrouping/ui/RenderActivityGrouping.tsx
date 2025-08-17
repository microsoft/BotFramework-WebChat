import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { hooks } from 'botframework-webchat-api';
import { type WebChatActivity } from 'botframework-webchat-core';
import React, { Fragment, memo } from 'react';
import { array, custom, object, pipe, readonly, safeParse, type InferInput } from 'valibot';

import useActivityRendererMap from '../../../providers/RenderingActivities/useActivityRendererMap';
import RenderActivity from './RenderActivity';

const { useGetKeyByActivity } = hooks;

const renderActivityGroupingPropsSchema = pipe(
  object({
    activities: pipe(array(custom<WebChatActivity>(value => safeParse(object({}), value).success)), readonly())
  }),
  readonly()
);

type RenderActivityGroupingProps = Readonly<InferInput<typeof renderActivityGroupingPropsSchema>>;

function RenderActivityGrouping(props: RenderActivityGroupingProps) {
  const { activities } = validateProps(renderActivityGroupingPropsSchema, props);

  const [activityRendererMap] = useActivityRendererMap();
  const getKeyByActivity = useGetKeyByActivity();

  return (
    <Fragment>
      {activities.map(activity => {
        const children = activityRendererMap.get(activity)?.({});

        // TODO: [P0] Activity key could be reused by multiple activities of same livestream group.
        //            We should update ActivityKeyer to have another more unique ID.
        return children && <RenderActivity activity={activity} key={getKeyByActivity(activity)} />;
      })}
    </Fragment>
  );
}

export default memo(RenderActivityGrouping);
export { renderActivityGroupingPropsSchema, type RenderActivityGroupingProps };
