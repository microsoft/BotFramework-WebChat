import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { getOrgSchemaMessage, PartGrouping, type WebChatActivity } from 'botframework-webchat/internal';
import cx from 'classnames';
import React, { memo, useMemo, type ReactNode } from 'react';
import { array, custom, object, optional, pipe, readonly, safeParse } from 'valibot';

import { useStyles, useVariantClassName } from '../../styles';

import styles from './PartGroupingDecorator.module.css';
import { getVoiceActivityRole } from 'botframework-webchat-core';

const partGroupingDecoratorPropsSchema = pipe(
  object({
    activities: pipe(array(custom<WebChatActivity>(value => safeParse(object({}), value).success)), readonly()),
    children: optional(reactNode())
  }),
  readonly()
);

// TODO: [P2] InferInput does not add the required readonly, need to have a better way to define props.
type PartGroupingDecoratorProps = {
  readonly activities: readonly WebChatActivity[];
  readonly children?: ReactNode | undefined;
};

function PartGroupingDecorator(props: PartGroupingDecoratorProps) {
  const {
    activities: [activity, ...restActivities]
  } = validateProps(partGroupingDecoratorPropsSchema, props);

  const classNames = useStyles(styles);
  const variantClassName = useVariantClassName(styles);

  const isInGroup = useMemo(
    () =>
      restActivities.length > 0 || !!(activity?.entities && getOrgSchemaMessage(activity.entities)?.isPartOf?.['@id']),
    [activity, restActivities.length]
  );

  // S2S-both user and bot transcript comes from server (RT-LLM) hence need to check role explicitly.
  const voiceActivityRole = activity && getVoiceActivityRole(activity);
  const isFromUser = activity?.from?.role === 'user' || voiceActivityRole === 'user';
  const isFromBot = activity?.from?.role === 'bot' || voiceActivityRole === 'bot';

  return (
    <div
      className={cx(
        classNames['part-grouping-decorator'],
        {
          [classNames['part-grouping-decorator--group']]: isInGroup,
          [classNames['part-grouping-decorator--from-user']]: isFromUser,
          [classNames['part-grouping-decorator--from-bot']]: isFromBot
        },
        variantClassName
      )}
    >
      <PartGrouping {...props} />
    </div>
  );
}

export default memo(PartGroupingDecorator);
export { type PartGroupingDecoratorProps };
