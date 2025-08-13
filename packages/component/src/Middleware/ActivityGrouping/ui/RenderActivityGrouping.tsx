import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { hooks } from 'botframework-webchat-api';
import { type WebChatActivity } from 'botframework-webchat-core';
import React, { Fragment, memo } from 'react';
import { array, custom, object, pipe, readonly, safeParse, type InferInput } from 'valibot';

import useActivityRendererMap from '../../../providers/RenderingActivities/useActivityRendererMap';

const { useGetKeyByActivity } = hooks;

const renderActivityGroupingPropsSchema = pipe(
  object({
    activities: pipe(array(custom<WebChatActivity>(value => safeParse(object({}), value).success)), readonly())
  }),
  readonly()
);

type RenderActivityGroupingProps = Readonly<InferInput<typeof renderActivityGroupingPropsSchema>>;

const RenderActivityGrouping = (props: RenderActivityGroupingProps) => {
  const { activities } = validateProps(renderActivityGroupingPropsSchema, props);

  const [activityRendererMap] = useActivityRendererMap();
  const getKeyByActivity = useGetKeyByActivity();

  return (
    <Fragment>
      {activities.map(activity => {
        const children = activityRendererMap.get(activity)?.({});

        // TODO: [P0] Activity key can be reused by multiple activities of same livestream group.
        //            We should update ActivityKeyer to have another more unique ID.
        return children && <Fragment key={getKeyByActivity(activity)}>{children}</Fragment>;
      })}
    </Fragment>
  );
};

RenderActivityGrouping.displayName = 'RenderActivityGrouping';

export default memo(RenderActivityGrouping);
export { renderActivityGroupingPropsSchema, type RenderActivityGroupingProps };
