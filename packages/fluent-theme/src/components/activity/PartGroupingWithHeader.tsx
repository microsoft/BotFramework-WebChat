import { type WebChatActivity } from 'botframework-webchat-core';
import { PartGrouping } from 'botframework-webchat-component/internal';
import React, { memo } from 'react';

import CopilotMessageHeader from './CopilotMessageHeader';
import useVariants from '../../private/useVariants';
import { useStyles } from '../../styles';
import styles from './PartGroupingWithHeader.module.css';

type PartGroupingWithHeaderProps = Readonly<{
  activities: readonly WebChatActivity[];
  children?: React.ReactNode;
}>;

function PartGroupingWithHeader(props: PartGroupingWithHeaderProps) {
  const {
    activities: [activity]
  } = props;
  const variants = useVariants();
  const classNames = useStyles(styles);

  const shouldRenderHeader = variants.includes('copilot') && activity?.from?.role === 'bot';

  return (
    <div className={classNames['part-grouping-with-header']}>
      {shouldRenderHeader && <CopilotMessageHeader activity={activity} />}
      <PartGrouping {...props} />
    </div>
  );
}

export default memo(PartGroupingWithHeader);
export { type PartGroupingWithHeaderProps };
