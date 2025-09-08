import { getOrgSchemaMessage, type WebChatActivity } from 'botframework-webchat-core';
import { PartGrouping } from 'botframework-webchat-component/internal';
import cx from 'classnames';
import React, { memo, useMemo } from 'react';

import CopilotMessageHeader from './CopilotMessageHeader';
import useVariants from '../../private/useVariants';
import { useStyles, useVariantClassName } from '../../styles';

import styles from './PartGroupingDecorator.module.css';

type PartGroupingDecoratorProps = Readonly<{
  activities: readonly WebChatActivity[];
  children?: React.ReactNode;
}>;

function PartGroupingDecorator(props: PartGroupingDecoratorProps) {
  const {
    activities: [activity, ...restActivities]
  } = props;
  const variants = useVariants();
  const classNames = useStyles(styles);
  const variantClassName = useVariantClassName(styles);

  const isInGroup = useMemo(
    () =>
      restActivities.length > 0 || !!(activity?.entities && getOrgSchemaMessage(activity.entities)?.isPartOf?.['@id']),
    [activity, restActivities.length]
  );

  const isFromUser = activity?.from?.role === 'user';
  const isFromBot = activity?.from?.role === 'bot';

  const shouldRenderHeader = variants.includes('copilot') && activity?.from?.role === 'bot';

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
      {shouldRenderHeader && (
        <CopilotMessageHeader activity={activity} className={classNames['part-grouping-decorator__header']} />
      )}
      <PartGrouping {...props} />
    </div>
  );
}

export default memo(PartGroupingDecorator);
export { type PartGroupingDecoratorProps };
