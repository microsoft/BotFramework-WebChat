import { type WebChatActivity } from 'botframework-webchat-core';
import { PartGrouping } from 'botframework-webchat-component/internal';
import cx from 'classnames';
import React, { memo } from 'react';

import CopilotMessageHeader from './CopilotMessageHeader';
import useVariants from '../../private/useVariants';
import { useStyles, useVariantClassName } from '../../styles';

import styles from './PartGroupingingDecorator.module.css';

type PartGroupingDecoratorProps = Readonly<{
  activities: readonly WebChatActivity[];
  children?: React.ReactNode;
}>;

function PartGroupingDecorator(props: PartGroupingDecoratorProps) {
  const {
    activities: [activity]
  } = props;
  const variants = useVariants();
  const classNames = useStyles(styles);
  const variantClassName = useVariantClassName(styles);

  const shouldRenderHeader = variants.includes('copilot') && activity?.from?.role === 'bot';

  return (
    <div className={cx(classNames['part-grouping-decorator'], variantClassName)}>
      {shouldRenderHeader && <CopilotMessageHeader className={classNames['part-grouping-decorator__header']} activity={activity} />}
      <PartGrouping {...props} />
    </div>
  );
}

export default memo(PartGroupingDecorator);
export { type PartGroupingDecoratorProps };
